<script lang="ts">
  import type { OutputSocket } from 'core/types';

  export let outputs: {
    Number: OutputSocket<number>;
  };

  const { value } = outputs.Number;
</script>

<input type="number" bind:value={$value} />
<br />
