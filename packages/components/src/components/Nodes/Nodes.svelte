<script lang="ts">
  import { nodesRegistry } from '.';
  import { Node as NodeType, uniqueNodeId } from '../Node';
  import { InputSockets, OutputSockets } from '../Sockets';
  import { createInputSocket, createOutputSocket } from '../Socket';
  import Node from '../Node/Node.svelte';
  
  export let nodes: Record<string, NodeType>;

  // Setup nodes to be consumed in DOM
  Object.keys(nodes).forEach((key) => {
    $nodesRegistry = {
      ...$nodesRegistry,
      [$uniqueNodeId]: {
        inputs: (() => {
          const inputs: InputSockets<Record<string, any>> = {};

          if (nodes[key].inputs) {
            Object.keys(nodes[key].inputs ?? {}).map((inputKey) => {
              const inputBlueprint = nodes[key].inputs?.[inputKey];
              if (inputBlueprint)
                inputs[inputKey] = createInputSocket(inputBlueprint.type, inputBlueprint?.defaultValue);
            });
          }

          return Object.keys(inputs).length > 0 ? inputs : undefined;
        })(),
        outputs: (() => {
          const outputs: OutputSockets<Record<string, any>> = {};

          if (nodes[key].outputs) {
            Object.keys(nodes[key].outputs ?? {}).map((inputKey) => {
              const outputBlueprint = nodes[key].outputs?.[inputKey];
              if (outputBlueprint)
                outputs[inputKey] = createOutputSocket(outputBlueprint.type, outputBlueprint?.defaultValue);
            });
          }
          return Object.keys(outputs).length > 0 ? outputs : undefined;
        })(),
        type: key,
        x: 0,
        y: 0,
        z: 0,
        component: nodes[key].component,
      },
    };

    $uniqueNodeId += 1;
  });

  console.log(nodes);
  console.log($nodesRegistry);

  $nodesRegistry['1'].inputs?.['Number'].connection.set({
    connectedNodeId: '0',
    connectedSocketId: 'Number',
  });
</script>

{#each Object.keys($nodesRegistry) as key}
  <Node
    title={$nodesRegistry[key].type}
    component={$nodesRegistry[key].component}
    inputs={$nodesRegistry[key].inputs}
    outputs={$nodesRegistry[key].outputs}
    coordinates={{
      x: $nodesRegistry[key].x,
      y: $nodesRegistry[key].y,
      z: $nodesRegistry[key].z,
    }}
  />
{/each}