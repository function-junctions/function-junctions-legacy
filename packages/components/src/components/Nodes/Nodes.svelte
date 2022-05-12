<script lang="ts">
  import {
    nodesRegistry,
    selectedNode,
    nodeMoving,
    onNodesWheel,
    nodesCoordinates,
    onNodesPan,
    nodesContainerMoving,
  } from '.';
  import { showLiveConnection, liveConnectionPoints } from '../Connection';
  import Connections from '../Connections/Connections.svelte';
  import {
    createNode,
    NodeBlueprint,
    uniqueNodeId,
    onNodeDrag,
  } from '../Node';
  import Node from '../Node/Node.svelte';

  import './Nodes.scss';
    
  export let nodes: Record<string, NodeBlueprint>;
  
  let containerRef: HTMLDivElement;
  let zoomRef: HTMLDivElement;
  
  // Setup nodes to be consumed in DOM
  Object.keys(nodes).forEach((key) => {
    $nodesRegistry = {
      ...$nodesRegistry,
      [$uniqueNodeId]: createNode(key, nodes[key]),
    };

    $uniqueNodeId += 1;
  });

  console.log(nodes);
  console.log($nodesRegistry);
</script>

<div
  class="function-junction-nodes"
  on:mouseup={() => {
    $nodeMoving = false;
    $nodesContainerMoving = false;
  }}
  on:mousemove={(event) =>{
    if ($nodesContainerMoving && !$nodeMoving) {
      onNodesPan(containerRef, event);
    } else if ($nodesContainerMoving && $nodeMoving && $selectedNode) {
      onNodeDrag($selectedNode, event);
    }
  }}
  on:click={() => $liveConnectionPoints && ($showLiveConnection = false)}
  on:wheel={onNodesWheel}
  on:mousedown={() => ($nodesContainerMoving = true)}
  bind:this={containerRef}
>
  <div
    class="function-junction-nodes-zoom"
    bind:this={zoomRef}
    style={`transform:
      translate(${$nodesCoordinates.x}px,${$nodesCoordinates.y}px) scale(${$nodesCoordinates.z},${$nodesCoordinates.z})
    `}
  >
    <Connections />
    {#each Object.keys($nodesRegistry) as key}
      <Node
        title={$nodesRegistry[key].type}
        id={key}
        component={$nodesRegistry[key].component}
        inputs={$nodesRegistry[key].inputs}
        outputs={$nodesRegistry[key].outputs}
        coordinates={{
          x: $nodesRegistry[key].x,
          y: $nodesRegistry[key].y,
        }}
        color={$nodesRegistry[key].color}
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