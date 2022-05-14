<script lang="ts">
  import { Point } from '../../types';
  import { getConnections } from '.';
  import { nodesCoordinates, nodesRegistry } from '../Nodes';
  import { showLiveConnection, liveConnectionPoints } from '../Connection';
  
  import Connection from '../Connection/Connection.svelte';
  let connections: { p1: Point, p2: Point }[];

  $: $nodesRegistry, $liveConnectionPoints, $nodesCoordinates, (connections = getConnections());
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