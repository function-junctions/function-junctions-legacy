<script lang="ts">
  import { Point } from '../../types';
  import { getConnections } from '.';
  import { nodesRegistry } from '../Nodes';
  import './Connections.scss';
  
  import Connection from '../Connection/Connection.svelte';

  let connections: { p1: Point, p2: Point }[];

  $: $nodesRegistry, (connections = getConnections());
</script>

<div class="function-junction-connections">
  {#each connections as connection}
    <Connection {connection} />
  {/each}
</div>