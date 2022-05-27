<style lang="scss" global>
  @import './Socket.scss';
</style>

<script lang="ts">
  import type { Editor } from '../Editor';

  export let title: string;
  export let type: 'input' | 'output';

  export let id: string;
  export let nodeId: string;
  export let socketType: string;

  export let color: string | undefined = undefined;
  
  export let editor: Editor;

  let ref: HTMLDivElement;
  let coordinates: DOMRect;

  const { position, readonly } = editor;
  const { current: nodes } = editor.nodes;

  $: $nodes[nodeId], $position, ref, (() => {
    if (ref) {
      coordinates = ref.getBoundingClientRect();
      const sockets = $nodes[nodeId][type === 'input' ? 'inputs' : 'outputs'];
      
      const translateX = (coordinates.left - $position.translateX);
      const translateY = (coordinates.top - $position.translateY);

      const offsetX = ($position.originX * $position.scale) - $position.originX;
      const offsetY = ($position.originY * $position.scale) - $position.originY;
      
      if (sockets) sockets[id].coordinates = {
        x: ((translateX + offsetX) / $position.scale),
        y: (translateY + offsetY) / $position.scale,
      };
    }
  })();
</script>

<div class={`function-junctions-socket function-junctions-socket-${type}`}>
  {#if type === 'output'}
    <div class="function-junctions-socket-title">{title}</div>
  {/if}
  <div
    class="function-junctions-socket-connection"
    style={color ? `background: ${color}` : ''}
    bind:this={ref}
    on:click={() => !$readonly && editor.sockets.connect(type, { nodeId, socketId: id, socketType })}
  />
  {#if type === 'input'}
    <div class="function-junctions-socket-title">{title}</div>
  {/if}
</div>