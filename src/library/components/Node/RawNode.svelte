<style lang="scss" global>
  @import './RawNode.scss';
</style>

<script lang="ts">
  import type { SvelteComponentDev } from 'svelte/internal';
  import type { Editor } from '../Editor';
  
  import type {
    InputSockets,
    OutputSockets,
    InputSocket,
    OutputSocket,
  } from '../Sockets';
  
  export let title: string;
  export let id: string;

  export let inputs: InputSockets<Record<string, InputSocket<any>>> | undefined;
  export let outputs: OutputSockets<Record<string, OutputSocket<any>>> | undefined;

  export let component: typeof SvelteComponentDev;
  export let store: Record<string, unknown> | undefined;

  export let editor: Editor;
</script>

<div class="function-junctions-raw-node">
  <div class="function-junctions-raw-node-content">
    <svelte:component
      this={component}
      {inputs}
      {outputs}
      {title}
      {id}
      {editor}
      bind:store
    />
  </div>
</div>