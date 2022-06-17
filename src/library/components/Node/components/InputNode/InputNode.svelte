<script lang="ts">
  import type { OutputSocket, OutputSockets, SocketBlueprint } from '../../../Sockets';
  
  import type { Writable } from 'svelte/store';
  import type { Editor } from '../../../Editor';
import Dropdown from '$lib/components/Dropdown/Dropdown.svelte';

  export let editor: Editor;
  
  export let outputs: OutputSockets<{
    Value: OutputSocket<unknown>;
  }>;

  const { value: Value } = outputs.Value;
  const { registered } = editor.nodes;
  const { inputs } = editor;
  
  let name = '';
  let type = '';
  let value: Writable<unknown> | undefined;

  let availableInputs: string[] = [];
  let sockets: SocketBlueprint[] = [];

  $: name, type, (() => {
    const store = editor.inputs?.[type]?.[name];
    value = store;
  })();

  $: if (value) {
    $Value = $value;
  }

  $: Object.keys($registered).forEach((key) => {
    let io = {
      ...$registered[key].inputs,
      ...$registered[key].outputs,
    };

    sockets = [
      ...sockets,
      ...Object.keys(io).map((key) => io[key]),
    ].filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.type === value.type
      )),
    ).filter((value) => !!value.type);
  });

  $: availableInputs = Object.keys(inputs?.[type] ?? {}).map((key) => key);

  $: {
    outputs.Value.type = type;
    outputs.Value.disabled = !value;
    outputs.Value.color = sockets.filter((socket) => socket.type === type)?.[0]?.color;
  }

  $: if (!type) type = sockets[0].type;
  $: if (!name) name = availableInputs[0];
</script>

<Dropdown title="Socket">
  <select bind:value={type}>
    {#each sockets as socket}
      <option value={socket.type}>{socket.type}</option>
    {/each}
  </select>
</Dropdown>

<Dropdown title="Input">
  <select bind:value={name}>
    {#each availableInputs as input}
      <option value={input}>{input}</option>
    {/each}
  </select>
</Dropdown>
<p />