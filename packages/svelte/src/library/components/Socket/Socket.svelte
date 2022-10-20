<script lang="ts">
  import { getTruePosition } from 'core/index';

  import type { Editor } from '../Editor';

  export let title: string;
  export let type: 'input' | 'output';

  export let id: string;
  export let nodeId: string;
  export let socketType: string;

  export let disabled: boolean | undefined = undefined;

  export let color: string | undefined = undefined;

  export let editor: Editor;

  let ref: HTMLDivElement;
  let coordinates: DOMRect;

  const { position, readonly } = editor;
  const { current: nodes } = editor.nodes;

  const connect = () =>
    !$readonly && editor.sockets.connect(type, { nodeId, socketId: id, socketType });

  $: $nodes[nodeId],
    $position,
    ref,
    (() => {
      if (ref) {
        coordinates = ref.getBoundingClientRect();
        const sockets = $nodes[nodeId]?.[type === 'input' ? 'inputs' : 'outputs'];

        const { x, y } = getTruePosition({
          x: coordinates.left,
          y: coordinates.top,
          translateX: $position.translateX,
          translateY: $position.translateY,
          originX: $position.originX,
          originY: $position.originY,
          scale: $position.scale,
        });

        if (sockets) sockets[id].coordinates = { x, y };
      }
    })();
</script>

<div class={`function-junctions-socket function-junctions-socket-${type}`} on:touchstart={connect}>
  {#if type === 'output'}
    <div class="function-junctions-socket-title">{title}</div>
  {/if}
  <div
    class={`function-junctions-socket-connection ${
      disabled ? 'function-junctions-socket-connection-disabled' : undefined
    }`}
    style={color ? `background: ${color}` : ''}
    bind:this={ref}
    on:click={connect}
  />
  {#if type === 'input'}
    <div class="function-junctions-socket-title">{title}</div>
  {/if}
</div>
