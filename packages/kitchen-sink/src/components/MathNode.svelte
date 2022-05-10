<script lang="ts">
  import type {
    InputSockets,
    InputSocket,
    OutputSocket,
    OutputSockets,
  } from '@function-junction/components/src/components';

  export let inputs: InputSockets<{
    Number: InputSocket<number>;
  }>;

  export let outputs: OutputSockets<{
    Number: OutputSocket<number>;
  }>;

  const { value: input } = inputs.Number;
  const { value: output } = outputs.Number;
  
  $: $output = $input * 3;
</script>

<h1>{$output}</h1>