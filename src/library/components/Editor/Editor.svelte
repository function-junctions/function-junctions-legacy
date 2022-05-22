<style lang="scss" global>
  @import './Editor.scss';
</style>

<script lang="ts">
  import { type EditorState, Editor as EditorClass } from '.';

  import type { NodeBlueprint } from '../Nodes';
  import Nodes from '../Nodes/Nodes.svelte';
  
  import { getAppearance } from '../Theme';
  
  export let nodes: Record<string, NodeBlueprint>;
  export let state: EditorState | undefined = undefined;
  
  export let multiselect = true;
  export let zoomable = true;
  export let pannable = true;
  export let moveable = true;
  
  export let editable = true;
  
  export let appearance: 'light' | 'dark' | 'auto' = 'auto';
  export let style = '';

  export let instance = new EditorClass(nodes, state, !editable);

  export let onReady: (() => void) | undefined = undefined;
  
  const appearanceClassName = getAppearance(appearance);

  const { readonly } = instance;

  $: editable = $readonly;
</script>

<div class={`function-junctions-editor function-junctions-appearance-${$appearanceClassName}`} {style}>
  <Nodes
    editor={instance}
    {multiselect}
    {zoomable}
    {pannable}
    {moveable}
    {onReady}
    bind:state
  />
</div>