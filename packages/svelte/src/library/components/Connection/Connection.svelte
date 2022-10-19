<script lang="ts">
  import type { Point } from 'core/index';
  import { createConnectionPath } from 'core/components/Connection';

  export let connection: { p1: Point; p2: Point };

  let ref: SVGSVGElement;

  $: createConnectionPath(ref, { p1: connection.p1, p2: connection.p2 });
</script>

<svg class="function-junctions-connection" bind:this={ref} />
