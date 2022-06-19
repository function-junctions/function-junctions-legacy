<script lang="ts">
  import type { InputSocket, InputSockets, SocketBlueprint } from '../../../Sockets';
  
  import type { Writable } from 'svelte/store';
  import type { Editor } from '../../../Editor';
  import Dropdown from '$lib/components/Dropdown/Dropdown.svelte';

  export let editor: Editor;
  
  export let inputs: InputSockets<{
    Value: InputSocket<unknown>;
  }>;

  const { value: Value } = inputs.Value;
  const { registered } = editor.nodes;
  
  let name = '';
  let type = '';

  let store: Writable<unknown> | undefined;
  
  let sockets: SocketBlueprint[] = [];

  $: name, type, (() => {
    if (store && Value) $store = $Value;
  })();

  $: store = editor.outputs?.[type]?.[name];

  $: Object.keys($registered).forEach((key) => {
    let io = {
      ...$registered[key].inputs,
      ...$registered[key].outputs,
    };

    sockets = [
      ...sockets,
      ...Object.keys(io).map((key) => io[key]),
    ].filter((socket, index, self) =>
      index === self.findIndex((t) => (
        t.type === socket.type
      )),
    ).filter((socket) => !!socket.type);
  });

  $: {
    inputs.Value.type = type;
    inputs.Value.disabled = !store;
    inputs.Value.color = sockets.filter((socket) => socket.type === type)?.[0]?.color;
  }

  $: if (!type) type = sockets[0].type;
</script>

<Dropdown title="Socket">
  <select bind:value={type}>
    {#each sockets as socket}
      <option value={socket.type}>{socket.type}</option>
    {/each}
  </select>
</Dropdown>
<p />
<div style="padding: 0 15px">
  <input type="text" placeholder="Name" bind:value={name} />
</div>
<p />