<style lang="scss" global>
  @import './Nodes.scss';
</style>

<script lang="ts">
  import type { Editor, EditorState } from '../Editor';
  import Drag, { getMatrix } from '../Drag';
  import Node from '../Node/Node.svelte';
  import Connections from '../Connections/Connections.svelte';
  import type { Point } from '../../types';
  
  export let editor: Editor;
  export let state: EditorState | undefined;
  
  export let multiselect: boolean;
  export let zoomable: boolean;
  export let pannable: boolean;
  export let moveable: boolean;

  export let onReady: ((editor: Editor) => void) | undefined = undefined;

  let ref: HTMLDivElement;

  const { position } = editor;
  const { current: nodes, selected: selectedNodesIds } = editor.nodes;
  const { restored: stateRestored, nodes: nodesState } = editor.state;
  const { show: showLiveConnection, state: liveConnectionState } = editor.connection;

  let nodeMoving = false;
  let containerMoving = false;

  let previousCoordinates: Point = {
    x: 0,
    y: 0,
  };

  const getCoordinates = (event: MouseEvent | TouchEvent) => {
    let pageX: number;
    let pageY: number;

    if ('touches' in event) {
      const touch = event.touches[0];

      pageX = touch.pageX;
      pageY = touch.pageY;
    } else {
      pageX = event.pageX;
      pageY = event.pageY;
    }

    return {
      pageX,
      pageY,
    };
  };

  const zoom = (event: WheelEvent) => {
    if (zoomable) {
      event.preventDefault();

      const factor = 3.5;
      dragger.zoom({
        deltaScale: Math.sign(event.deltaY) > 0 ? -factor : factor,
        x: event.pageX,
        y: event.pageY,
      });
    }
  };

  const startDrag = (event: MouseEvent | TouchEvent) => {
    if (('button' in event) && event.button === 2) return;
    const { pageX, pageY } = getCoordinates(event);

    previousCoordinates.x = pageX;
    previousCoordinates.y = pageY;

    containerMoving = true;
  };

  const endDrag = () => {
    nodeMoving = false;
    containerMoving = false;
  };

  const drag = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    const { pageX, pageY } = getCoordinates(event);

    const movementX = pageX - (previousCoordinates?.x ?? 0);
    const movementY = pageY - (previousCoordinates?.y ?? 0);

    if (containerMoving && !nodeMoving && pannable) {
      dragger.panBy({
        originX: movementX,
        originY: movementY,
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
                x: node.x + movementX / scale,
                y: node.y + movementY / scale,
              },
            }));
          }
        }
      });
    }

    previousCoordinates.x = pageX; 
    previousCoordinates.y = pageY; 
  };

  const dragNode = (event: MouseEvent | TouchEvent, key: string) => {
    if (('button' in event) && event.button === 2) return;
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
  };

  $: dragger = Drag({
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

  $: if (stateRestored) onReady && onReady(editor);
</script>

<div
  class="function-junctions-nodes"
  on:click={() => $liveConnectionState && ($showLiveConnection = false)}
  on:wheel={zoom}
  on:mousedown={startDrag}
  on:mouseup={endDrag}
  on:mousemove={drag}
  on:touchstart={startDrag}
  on:touchend={endDrag}
  on:touchmove={drag}
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
        on:mousedown={(event) => dragNode(event, key)}
        on:touchstart={(event) => dragNode(event, key)}
      />
    {/each}
  </div>
</div>