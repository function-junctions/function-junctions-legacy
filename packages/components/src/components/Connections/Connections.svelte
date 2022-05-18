<script lang="ts">
  import { Point } from '../../types';
  import { nodesCoordinates, activeNodes, nodesStateRestored } from '../Nodes/store';
  import { showLiveConnection, liveConnectionPoints } from '../Connection/store';
  
  import { get } from 'svelte/store';
  import Connection from '../Connection/Connection.svelte';

  const getConnections = (): { p1: Point, p2: Point }[] => {
    let connections: { p1: Point, p2: Point }[] = [];

    Object.keys($activeNodes).forEach((nodeId) => {
      const inputs = $activeNodes[nodeId].inputs;
      if (inputs) {
        Object.keys(inputs).forEach((id) => {
          const input = inputs?.[id];
          if (input.connection) {
            const connection = get(input.connection);

            if (connection) {
              const output = $activeNodes[connection.connectedNodeId].outputs?.[connection.connectedSocketId];

              if (output) {
                connections = [
                  ...connections,
                  {
                    p1: {
                      x: input.coordinates.x,
                      y: input.coordinates.y,
                    },
                    p2: {
                      x: output.coordinates?.x,
                      y: output.coordinates?.y,
                    },
                  },
                ];
              }
            }
          }
        });
      }
    });

    return connections;
  };

  let connections: { p1: Point, p2: Point }[];

  $: $nodesStateRestored, $activeNodes, $liveConnectionPoints, $nodesCoordinates, (connections = getConnections());
</script>

<div
  class="function-junction-connections"
>
  {#each connections as connection}
    <Connection {connection} />
  {/each}

  {#if $showLiveConnection}
    {#if
      $liveConnectionPoints?.points.p1.x
      && $liveConnectionPoints?.points.p1.y
      && $liveConnectionPoints?.points.p2.x
      && $liveConnectionPoints?.points.p2.y
    }
      <Connection connection={$liveConnectionPoints.points} />
    {/if}
  {/if}
</div>