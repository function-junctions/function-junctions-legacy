<script lang="ts">
  import { Point } from '../../types';
  import { getConnections } from '.';
  import { nodesRegistry } from '../Nodes';
  import './Connections.scss';
  import { showLiveConnection, liveConnectionPoints } from '../Connection';
  
  import Connection from '../Connection/Connection.svelte';
  let connections: { p1: Point, p2: Point }[];

  $: $nodesRegistry, (connections = getConnections());
</script>

<div class="function-junction-connections">
  {#each connections as connection}
    <Connection {connection} />
  {/each}

  {#if $showLiveConnection}
    {#if
      $liveConnectionPoints?.p1.x
      && $liveConnectionPoints?.p1.y
      && $liveConnectionPoints?.p2.x
      && $liveConnectionPoints?.p2.y
    }
      <Connection connection={$liveConnectionPoints} />
    {/if}
  {/if}
</div>