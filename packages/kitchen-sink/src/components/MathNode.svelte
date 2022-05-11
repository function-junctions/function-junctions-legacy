<script lang="ts">
  import type {
    InputSockets,
    InputSocket,
    OutputSocket,
    OutputSockets,
  } from '@function-junction/components/src/components';

  export let inputs: InputSockets<{
    LHS: InputSocket<number>;
    RHS: InputSocket<number>;
  }>;

  export let outputs: OutputSockets<{
    Number: OutputSocket<number>;
  }>;

  const { value: LHS } = inputs.LHS;
  const { value: RHS } = inputs.RHS;
  
  const { value: output } = outputs.Number;
  
  $: $output = $LHS * $RHS;
</script>

<h1>{$output}</h1>