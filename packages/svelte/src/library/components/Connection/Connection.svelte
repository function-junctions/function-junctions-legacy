<script lang="ts">
  import { type Point, createConnectionPath } from 'core/index';

  export let connection: { p1: Point; p2: Point };

  let ref: SVGSVGElement;

  $: createConnectionPath(ref, { p1: connection.p1, p2: connection.p2 });
</script>

<svg class="function-junctions-connection" bind:this={ref} />
