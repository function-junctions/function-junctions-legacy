<script lang="ts">
  import { Point } from '../../types';
  import { createConnectionPath } from '.';

  import './Connection.scss';

  export let connection: { p1: Point, p2: Point };

  let ref: SVGSVGElement;'';

  $: createConnectionPath(ref, { p1: connection.p1, p2: connection.p2 });
</script>

<svg class="function-junction-connection" bind:this={ref} />
