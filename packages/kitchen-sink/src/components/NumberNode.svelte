<script lang="ts">
  import type { OutputSocket, OutputSockets } from '@function-junction/components/src/components';
  
  export let outputs: OutputSockets<{
    Number: OutputSocket<number>;
  }>;

  const { value } = outputs.Number;
</script>

<input type="number" bind:value={$value} />
<br />
<br />