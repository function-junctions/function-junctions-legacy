<script lang="ts">
  import { nodesCoordinates, nodesRegistry } from '../Nodes';
  import { createSocketConnection } from '.';

  import './Socket.scss';

  export let title: string;
  export let type: 'input' | 'output';

  export let id: string;
  export let nodeId: string;

  export let color: string | undefined = undefined;

  let ref: HTMLDivElement;
  let coordinates: DOMRect;

  $: $nodesRegistry[nodeId], $nodesCoordinates, ref, (() => {
    if (ref) {
      coordinates = ref.getBoundingClientRect();
      const sockets = $nodesRegistry[nodeId][type === 'input' ? 'inputs' : 'outputs'];
  
      if (sockets) sockets[id].coordinates = {
        x: (coordinates.left - $nodesCoordinates.x) / ($nodesCoordinates?.z ?? 1),
        y: (coordinates.top - $nodesCoordinates.y) / ($nodesCoordinates?.z ?? 1),
      };
    }
  })();
</script>

<div class={`function-junction-socket function-junction-socket-${type}`}>
  {#if type === 'output'}
    <div class="function-junction-socket-title">{title}</div>
  {/if}
  <div
    class="function-junction-socket-connection"
    style={color ? `background: ${color}` : ''}
    bind:this={ref}
    on:click={() => createSocketConnection({ [type]: { nodeId, socketId: id } })}
  />
  {#if type === 'input'}
    <div class="function-junction-socket-title">{title}</div>
  {/if}
</div>