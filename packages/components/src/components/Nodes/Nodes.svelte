<script lang="ts">
  import { nodesRegistry, selectedNode, nodeMoving } from '.';
import Connections from '../Connections/Connections.svelte';
  import {
    registerNode,
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
      [$uniqueNodeId]: registerNode(key, nodes[key]),
    };

    $uniqueNodeId += 1;
  });

  console.log(nodes);
  console.log($nodesRegistry);

  $nodesRegistry['1'].inputs?.['Number'].connection.set({
    connectedNodeId: '0',
    connectedSocketId: 'Number',
  });

  $nodesRegistry['2'].inputs?.['Number'].connection.set({
    connectedNodeId: '1',
    connectedSocketId: 'Number',
  });
</script>

<div
  class="function-junction-nodes"
  on:mouseup={() => ($nodeMoving = false)}
  on:mousemove={(event) => $nodeMoving && onNodeDrag($selectedNode, event)}
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
      on:mousedown={() => {
        $selectedNode = key;
        $nodeMoving = true;
      }}
    />
    <br />
    <br />
  {/each}
</div>