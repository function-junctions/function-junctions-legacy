<style lang="scss" global>
  @import './Connections.scss';
</style>

<script lang="ts">
  import type { Point } from '../../types';
  import type { Editor } from '../Editor';
  
  import { get } from 'svelte/store';
  import Connection from '../Connection/Connection.svelte';
import { tick } from 'svelte';

  export let editor: Editor;

  const { position } = editor;
  const { current: nodes } = editor.nodes;
  const { restored } = editor.state;
  const { state: liveConnection, show: showLiveConnection } = editor.connection;

  const getConnections = () => {
    let newConnections: { p1: Point, p2: Point }[] = [];

    void tick().then(() => {
      Object.keys($nodes).forEach((nodeId) => {
        const inputs = $nodes[nodeId].inputs;
        if (inputs) {
          Object.keys(inputs).forEach((id) => {
            const input = inputs?.[id];
            if (input.connection) {
              const connection = get(input.connection);
  
              if (connection) {
                const output = $nodes[connection.connectedNodeId]?.outputs?.[connection.connectedSocketId];
  
                if (output) {
                  newConnections = [
                    ...newConnections,
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

      connections = newConnections;
    });
  };

  let connections: { p1: Point, p2: Point }[] = [];

  $: $restored, $nodes, $liveConnection, $position, getConnections();
</script>

<div
  class="function-junctions-connections"
>
  {#each connections as connection}
    <Connection {connection} />
  {/each}

  {#if $showLiveConnection}
    {#if $liveConnection?.points}
      <Connection connection={$liveConnection.points} />
    {/if}
  {/if}
</div>