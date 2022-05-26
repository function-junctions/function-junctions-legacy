<script lang="ts">
  import type { OutputSocket, OutputSockets } from '../../library/types';
  
  export let outputs: OutputSockets<{
    Number: OutputSocket<number>;
  }>;

  const { value } = outputs.Number;
</script>

<input type="number" bind:value={$value} />
<br />