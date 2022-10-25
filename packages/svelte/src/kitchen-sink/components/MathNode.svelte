<script lang="ts">
  import type { FJ } from '@/library';

  export let inputs: {
    LHS: FJ.InputSocket<number>;
    RHS: FJ.InputSocket<number>;
  };

  export let outputs: {
    Number: FJ.OutputSocket<number>;
  };

  export let store: {
    type: 'addition' | 'subtraction' | 'multiplication' | 'division';
  } = {
    type: 'addition',
  };

  const { value: LHS } = inputs.LHS;
  const { value: RHS } = inputs.RHS;

  const { value: output } = outputs.Number;

  const getValue = () => {
    const { type } = store;

    switch (type) {
      case 'addition':
        $output = $LHS + $RHS;
        break;
      case 'subtraction':
        $output = $LHS - $RHS;
        break;
      case 'multiplication':
        $output = $LHS * $RHS;
        break;
      case 'division':
        $output = $LHS / $RHS;
        break;
    }
  };

  $: inputs, store, getValue();
</script>

<h1 style="text-align: center">{$output}</h1>
<select bind:value={store.type}>
  <option value="addition">Addition</option>
  <option value="subtraction">Subtraction</option>
  <option value="multiplication">Multiplication</option>
  <option value="division">Division</option>
</select>
