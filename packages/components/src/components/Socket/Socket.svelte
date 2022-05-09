<script lang="ts">
  import { onMount } from 'svelte';

  import { nodesRegistry } from '../Nodes';

  import './Socket.scss';

  export let title: string;
  export let type: 'input' | 'output';

  export let id: string;
  export let nodeId: string;

  export let color: string | undefined = undefined;

  let ref: HTMLDivElement;
  let coordinates: DOMRect;

  $: $nodesRegistry[nodeId], (() => {
    coordinates = ref?.getBoundingClientRect();
    const sockets = $nodesRegistry[nodeId][type === 'input' ? 'inputs' : 'outputs'];

    if (sockets) {
      sockets[id].coordinates = {
        x: coordinates?.left ?? 0,
        y: coordinates?.top ?? 0,
      };
    }
  })();
</script>

<div class={`function-junction-socket function-junction-socket-${type}`}>
  {#if type === 'output'}
    <div class="function-junction-socket-title">{title}</div>
  {/if}
  <div class="function-junction-socket-connection" style={`background: ${color}`} bind:this={ref} />
  {#if type === 'input'}
    <div class="function-junction-socket-title">{title}</div>
  {/if}
</div>