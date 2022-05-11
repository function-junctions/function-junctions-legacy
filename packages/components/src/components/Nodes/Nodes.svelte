<script lang="ts">
  import { nodesRegistry, selectedNode, nodeMoving } from '.';
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
  on:mouseup={() => ($nodeMoving = false)}
  on:mousemove={(event) => $nodeMoving && onNodeDrag($selectedNode, event)}
  on:click={() => $liveConnectionPoints && ($showLiveConnection = false)}
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
        z: $nodesRegistry[key].z,
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