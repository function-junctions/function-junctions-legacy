<script lang="ts">
  export let text: string;
  export let color: string | undefined = undefined;
  export let background: string | undefined = undefined;
</script>

<button
  class="function-junctions-node_button"
  style={`
    ${color ? `color: ${color};` : ''}
    ${background ? `background: ${background}` : ''}`}
  on:click
>
  {text}
</button>
