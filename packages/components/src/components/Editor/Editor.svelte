<script lang="ts">
  import { EditorState, Editor } from '.';

  import { NodeBlueprint } from '../Nodes';
  import Nodes from '../Nodes/Nodes.svelte';
  
  import { getAppearance } from '../Theme';

  import './Editor.scss';
  
  export let nodes: Record<string, NodeBlueprint>;
  export let state: EditorState | undefined = undefined;
  
  export let multiselect = true;
  export let zoomable = true;
  export let pannable = true;
  export let moveable = true;
  
  export let editable = true;
  
  export let appearance: 'light' | 'dark' | 'auto' = 'auto';
  export let style = '';

  export let instance = new Editor(nodes, state, !editable);

  export let onReady: (() => void) | undefined = undefined;
  
  const appearanceClassName = getAppearance(appearance);

  const { readonly } = instance;

  $: editable = $readonly;
</script>

<div class={`function-junction-editor function-junction-appearance-${$appearanceClassName}`} {style}>
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