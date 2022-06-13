<script lang="ts">
  import type { OutputSocket, OutputSockets } from '../../../Sockets';
  
  import type { Writable } from 'svelte/store';
  import type { Editor } from '../../../Editor';

  export let editor: Editor;

  export let outputs: OutputSockets<{
    Value: OutputSocket<unknown>;
  }>;

  const { value: Value } = outputs.Value;
  
  let name = '';
  let value: Writable<unknown>;
  
  $: name, (() => {
    const store = editor.inputs?.[name];
    if (store) value = store;
  })();

  $: $value, ($Value = $value);
</script>

<select>

</select>
<input bind:value={name} />