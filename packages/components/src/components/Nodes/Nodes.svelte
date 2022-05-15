<script lang="ts">
  import {
    onNodesWheel,
    onNodesPan,
    NodesState,
    restoreNodesState,
    updateNodesState,
  } from '.';
  import {
    activeNodes,
    selectedNode,
    nodeMoving,
    nodesCoordinates,
    nodesContainerMoving,
    registeredNodes,
    nodesState,
  } from './store';
  import { showLiveConnection, liveConnectionPoints } from '../Connection/store';
  import Connections from '../Connections/Connections.svelte';
  import { addNode, NodeBlueprint, onNodeDrag } from '../Node';
  import Node from '../Node/Node.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  import './Nodes.scss';

  import Drag from '../Drag';
    
  export let nodes: Record<string, NodeBlueprint>;
  export let state: NodesState = {};

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
  $: state = $nodesState;
  
  $: if ($registeredNodes) {
    if (propState) restoreNodesState(propState);
    
    addNode('Math');
    addNode('Math');
    addNode('Math');
    addNode('Number');
    addNode('Number');

    dispatch('ready');
  }

  $: $activeNodes, updateNodesState();
  $: console.log($nodesState);
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
    } else if ($nodesContainerMoving && $nodeMoving && $selectedNode) {
      onNodeDrag($selectedNode, event);
    }
  }}
  on:click={() => $liveConnectionPoints && ($showLiveConnection = false)}
  on:wheel={(event) => onNodesWheel(instance, event)}
  on:mousedown={() => ($nodesContainerMoving = true)}
>
  <div
    class="function-junction-nodes-zoom"
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
        selected={$selectedNode === key}
        on:mousedown={() => {
          $selectedNode = key;
          $nodeMoving = true;
        }}
      />
      <br />
      <br />
    {/each}
  </div>
</div>