<script lang="ts">
  import {
    onNodesWheel,
    onNodesPan,
    restoreNodesState,
    updateNodesState,
  } from '.';
  import {
    activeNodes,
    selectedNodes,
    nodeMoving,
    nodesCoordinates,
    nodesContainerMoving,
    registeredNodes,
    nodesState,
    nodesStateRestored,
    lastSelectedNode,
  } from './store';
  import { getMatrix } from '../Drag';
  import { EditorState } from '../Editor';
  import { showLiveConnection, liveConnectionPoints } from '../Connection/store';
  import Connections from '../Connections/Connections.svelte';
  import { NodeBlueprint, onNodeDrag, Node as NodeType } from '../Node';
  import Node from '../Node/Node.svelte';
  import { tick } from 'svelte';

  import './Nodes.scss';

  import Drag from '../Drag';
    
  export let nodes: Record<string, NodeBlueprint>;
  export let state: EditorState = {
    nodes: {},
    coordinates: $nodesCoordinates,
  };
  
  export let multiselect = true;

  export let onEditorContextMenu: ((event: MouseEvent) => void) | undefined = undefined;
  export let onNodeContextMenu: ((event: MouseEvent, node: NodeType) => void) | undefined = undefined;

  export let onReady: (() => void) | undefined = undefined;
  
  $nodesCoordinates = state.coordinates;
  let propState = state;

  let zoomRef: HTMLDivElement;
  
  $: instance = Drag({
    scaleSensitivity: 100,
    minScale: .1,
    maxScale: 30,
    element: zoomRef,
    transformation: nodesCoordinates,
  });

  $: $registeredNodes = nodes;
  
  $: if ($registeredNodes) {
    if (propState.nodes) restoreNodesState(propState.nodes);

    void tick().then(() => {
      $nodesStateRestored = true;
      onReady && onReady();
    });
  }

  $: $activeNodes, updateNodesState();
  $: $nodesState, $nodesCoordinates, state = {
    nodes: $nodesState,
    coordinates: $nodesCoordinates,
  };

  $: console.log(JSON.stringify(state));
</script>

<div
  class="function-junction-nodes"
  on:mouseup={() => {
    $nodeMoving = false;
    $nodesContainerMoving = false;
  }}
  on:mousemove={(event) => {
    if ($nodesContainerMoving && !$nodeMoving) {
      onNodesPan(instance, event);
    } else if ($nodesContainerMoving && $nodeMoving && $selectedNodes) {
      $selectedNodes.forEach((node) => onNodeDrag(node, event));
    }
  }}
  on:click={() => $liveConnectionPoints && ($showLiveConnection = false)}
  on:wheel={(event) => onNodesWheel(instance, event)}
  on:mousedown={(event) => {
    if (event.button === 2) return;
    $nodesContainerMoving = true;
  }}
  on:contextmenu={(event) => onEditorContextMenu && onEditorContextMenu(event)}
>
  <div
    class="function-junction-nodes-zoom"
    style={`
      transform-origin: ${$nodesCoordinates.originX}px ${$nodesCoordinates.originY}px;
      transform: ${getMatrix({
        scale: $nodesCoordinates.scale,
        translateX: $nodesCoordinates.translateX,
        translateY: $nodesCoordinates.translateY,
      })}
    `}
    bind:this={zoomRef}
  >
    <Connections />
    {#each Object.keys($activeNodes) as key}
      <Node
        title={$activeNodes[key].type}
        id={key}
        component={$activeNodes[key].component}
        inputs={$activeNodes[key].inputs}
        outputs={$activeNodes[key].outputs}
        coordinates={{
          x: $activeNodes[key].x,
          y: $activeNodes[key].y,
        }}
        color={$activeNodes[key].color}
        selected={$selectedNodes.some((selectedNodeId) => key === selectedNodeId)}
        on:contextmenu={(event) => {
          event.stopPropagation();
          if (onNodeContextMenu) onNodeContextMenu(event, $activeNodes[key]);
        }}
        on:mousedown={(event) => {
          if (event.button === 2) return;
          if (
            event.shiftKey
            && multiselect
            && !$selectedNodes.some((selectedNodeId) => key === selectedNodeId)
          ) {
            $selectedNodes = [...$selectedNodes, key];
          } else {
            $selectedNodes = [key];
          }

          $lastSelectedNode = key;
          
          $nodeMoving = true;
        }}
      />
      <br />
      <br />
    {/each}
  </div>
</div>