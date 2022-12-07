<script lang="ts">
  import { type Point, getConnections } from 'core/index';

  import Connection from '../Connection/Connection.svelte';
  import type { Editor } from '../Editor';

  export let editor: Editor;

  const { position } = editor;
  const { current: nodes } = editor.nodes;
  const { restored } = editor.state;
  const { state: liveConnection, show: showLiveConnection } = editor.connection;

  let connections: { p1: Point; p2: Point }[] = [];

  $: $restored, $nodes, $liveConnection, $position, (connections = getConnections($nodes));
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
