<script lang="ts">
  import type { InputSocket, OutputSocket } from 'core/types';

  import { List, ListInput } from 'framework7-svelte';

  export let inputs: {
    BASE: InputSocket<number>;
    POWER: InputSocket<number>;
  };

  export let outputs: {
    Number: OutputSocket<number>;
  };

  export let store: {
    type: 'sqrt' | 'power';
  } = {
    type: 'sqrt',
  };

  const { value: BASE } = inputs.BASE;
  const { value: POWER } = inputs.POWER;

  const { value: output } = outputs.Number;

  const sqrt = (base: number, power: number): number => Math.pow(base, 1 / power);

  const getValue = () => {
    const { type } = store;

    switch (type) {
      case 'sqrt':
        $output = sqrt($BASE, $POWER);
        break;
      case 'power':
        $output = sqrt($BASE, 1 / $POWER);
        break;
    }
  };

  $: inputs, store, getValue();
</script>

<h1 style="text-align: center">{$output}</h1>
<List class="no-margin" noHairlines>
  <ListInput label="Type" type="select" bind:value={store.type}>
    <i class="icon demo-list-icon" slot="media" />
    <option value="sqrt">Square Root</option>
    <option value="power">Power</option>
  </ListInput>
</List>
