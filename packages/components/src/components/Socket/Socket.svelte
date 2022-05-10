<script lang="ts">
  import { nodesRegistry } from '../Nodes';
  import { createTemporaryOutputConnection } from '../Connection';

  import './Socket.scss';

  export let title: string;
  export let type: 'input' | 'output';

  export let id: string;
  export let nodeId: string;

  export let color: string | undefined = undefined;

  let ref: HTMLDivElement;
  let coordinates: DOMRect;

  $: $nodesRegistry[nodeId], ref, (() => {
    coordinates = ref?.getBoundingClientRect();
    const sockets = $nodesRegistry[nodeId][type === 'input' ? 'inputs' : 'outputs'];

    if (sockets) sockets[id].coordinates = {
      x: coordinates?.left ?? 0,
      y: coordinates?.top ?? 0,
    };
  })();
</script>

<div class={`function-junction-socket function-junction-socket-${type}`}>
  {#if type === 'output'}
    <div class="function-junction-socket-title">{title}</div>
  {/if}
  <div
    class="function-junction-socket-connection"
    style={`background: ${color}`}
    bind:this={ref}
    on:click={type === 'input' ? () => undefined : () => createTemporaryOutputConnection({ nodeId, id })}
  />
  {#if type === 'input'}
    <div class="function-junction-socket-title">{title}</div>
  {/if}
</div>