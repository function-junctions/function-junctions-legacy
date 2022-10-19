<script lang="ts">
  import type { Point } from 'core/index';
  import { getConnections } from 'core/index';

  import Connection from '../Connection/Connection.svelte';
  import type { SvelteEditor } from '../Editor';

  export let editor: SvelteEditor;

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
      .then((newConnections) => {
        connections = newConnections;
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
