<script lang="ts">
  import type { FJ } from '@/library';

  export let outputs: {
    Number: FJ.OutputSocket<number>;
  };

  const { value } = outputs.Number;
</script>

<input type="number" bind:value={$value} />
<br />
