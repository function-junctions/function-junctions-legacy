<script lang="ts">
  import type { InputSocket, OutputSocket } from 'core/types';

  import { List, ListInput } from 'framework7-svelte';

  export let inputs: {
    LHS: InputSocket<number>;
    RHS: InputSocket<number>;
  };

  export let outputs: {
    Number: OutputSocket<number>;
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
<List class="no-margin" noHairlines>
  <ListInput label="Type" type="select" bind:value={store.type}>
    <i class="icon demo-list-icon" slot="media" />
    <option value="addition">Addition</option>
    <option value="subtraction">Subtraction</option>
    <option value="multiplication">Multiplication</option>
    <option value="division">Division</option>
  </ListInput>
</List>
