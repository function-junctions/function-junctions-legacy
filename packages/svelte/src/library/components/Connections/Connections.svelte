<script lang="ts">
  import type { Point } from 'core/types';
  import type { Editor } from 'core/components/Editor';
  import { getConnections } from 'core/components/connections';

  import Connection from '../Connection/Connection.svelte';

  export let editor: Editor;

  const { position } = editor;
  const { current: nodes } = editor.nodes;
  const { restored } = editor.state;
  const { state: liveConnection, show: showLiveConnection } = editor.connection;

  let connections: { p1: Point; p2: Point }[] = [];

  $: $restored,
    $nodes,
    $liveConnection,
    $position,
    getConnections($nodes)
      .then((newConnection) => {
        connections = newConnection;
      })
      .catch(() => console.error('Failed to get connections'));
</script>

<div class="function-junctions-connections">
  {#each connections as connection}
    <Connection {connection} />
  {/each}

  {#if $showLiveConnection}
    {#if $liveConnection?.points}
      <Connection connection={$liveConnection.points} />
    {/if}
  {/if}
</div>
