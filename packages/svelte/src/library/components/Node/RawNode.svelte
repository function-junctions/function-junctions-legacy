<script lang="ts">
  import type { SvelteComponentDev } from 'svelte/internal';

  import type { InputSocket, OutputSocket } from 'core/components/Sockets';
  import type { SvelteEditor } from '../Editor';

  export let title: string;
  export let id: string;

  export let inputs: Record<string, InputSocket<any>> | undefined;
  export let outputs: Record<string, OutputSocket<any>> | undefined;

  export let component: typeof SvelteComponentDev;
  export let store: Record<string, unknown> | undefined;

  export let editor: SvelteEditor;
</script>

<div class="function-junctions-raw-node">
  <div class="function-junctions-raw-node-content">
    <svelte:component this={component} {inputs} {outputs} {title} {id} {editor} bind:store />
  </div>
</div>
