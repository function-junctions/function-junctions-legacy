<style lang="scss" global>
  @import './Nodes.scss';
</style>

<script lang="ts">
  import type { Editor, EditorState } from '../Editor';
  import Drag, { getMatrix } from '../Drag';
  import Node from '../Node/Node.svelte';
  import Connections from '../Connections/Connections.svelte';
  
  export let editor: Editor;
  export let state: EditorState | undefined;
  
  export let multiselect: boolean;
  export let zoomable: boolean;
  export let pannable: boolean;
  export let moveable: boolean;

  export let onReady: (() => void) | undefined = undefined;

  let ref: HTMLDivElement;

  const { position } = editor;
  const { current: nodes, selected: selectedNodesIds } = editor.nodes;
  const { restored: stateRestored, nodes: nodesState } = editor.state;
  const { show: showLiveConnection, state: liveConnectionState } = editor.connection;

  let nodeMoving = false;
  let containerMoving = false;

  $: drag = Drag({
    scaleSensitivity: 100,
    minScale: .1,
    maxScale: 30,
    element: ref,
    transformation: position,
  });

  $: $nodes, (() => {
    if (stateRestored) editor.updateState();
  })();

  $: $nodesState, $position, state = {
    nodes: $nodesState,
    position: $position,
  };

  $: if (stateRestored) onReady && onReady();
</script>

<div
  class="function-junctions-nodes"
  on:click={() => $liveConnectionState && ($showLiveConnection = false)}
  on:wheel={(event) => {    
    if (zoomable) {
      event.preventDefault();

      const factor = 3.5;
      drag.zoom({
        deltaScale: Math.sign(event.deltaY) > 0 ? -factor : factor,
        x: event.pageX,
        y: event.pageY,
      });
    }
  }}
  on:mousedown={(event) => {
    if (event.button === 2) return;
    containerMoving = true;
  }}
  on:mouseup={() => {
    nodeMoving = false;
    containerMoving = false;
  }}
  on:mousemove={(event) => {
    event.preventDefault();

    if (containerMoving && !nodeMoving && pannable) {
      drag.panBy({
        originX: event.movementX,
        originY: event.movementY,
      });
    } else if (containerMoving && nodeMoving && $selectedNodesIds && moveable) {
      $selectedNodesIds.forEach((id) => {
        if ($selectedNodesIds.some((selectedNodeId) => id === selectedNodeId)) {
          const node = $nodes[id];

          // Get z coordinate to determine scale so nodes travel faster with scale
          const { scale } = $position;

          if (node) {
            nodes.update((prevNode) => ({
              ...prevNode,
              [id]: {
                ...node,
                x: node.x + event.movementX / scale,
                y: node.y + event.movementY / scale,
              },
            }));
          }
        }
      });
    }
  }}
>
  <div
    class="function-junctions-nodes-zoom"
    style={`
      transform-origin: ${$position.originX}px ${$position.originY}px;
      transform: ${getMatrix({
        scale: $position.scale,
        translateX: $position.translateX,
        translateY: $position.translateY,
      })}
    `}
    bind:this={ref}
  >
    <Connections {editor} />
    {#each Object.keys($nodes) as key}
      <Node
        title={$nodes[key].type}
        id={key}
        component={$nodes[key].component}
        inputs={$nodes[key].inputs}
        outputs={$nodes[key].outputs}
        coordinates={{
          x: $nodes[key].x,
          y: $nodes[key].y,
        }}
        color={$nodes[key].color}
        className={$nodes[key].className}
        style={$nodes[key].style}
        selected={$selectedNodesIds.some((selectedNodeId) => key === selectedNodeId)}
        {editor}
        bind:store={$nodesState[key].store}
        on:mousedown={(event) => {
          if (event.button === 2) return;
          if (!moveable) return;

          if (
            event.shiftKey
            && multiselect
            && !$selectedNodesIds.some((selectedNodeId) => key === selectedNodeId)
          ) {
            $selectedNodesIds = [...$selectedNodesIds, key];
          } else {
            $selectedNodesIds = [key];
          }
          
          nodeMoving = true;
        }}
      />
    {/each}
  </div>
</div>