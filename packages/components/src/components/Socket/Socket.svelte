<script lang="ts">
  import './Socket.scss';

  export let title: string;
  export let color: string | undefined = undefined;

  export let type: 'input' | 'output';
</script>

<div class={`function-junction-socket function-junction-socket-${type}`}>
  {#if type === 'output'}
    <div class="function-junction-socket-title">{title}</div>
  {/if}
  <div class="function-junction-socket-connection" style={`background: ${color}`} />
  {#if type === 'input'}
    <div class="function-junction-socket-title">{title}</div>
  {/if}
</div>