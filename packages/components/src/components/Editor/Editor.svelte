<script lang="ts">
  import { EditorState } from './index';

  import { NodeBlueprint, Node } from '../Node';
  
  import Nodes from '../Nodes/Nodes.svelte';
  import { getAppearance } from '../Theme';

  import './Editor.scss';
  
  export let nodes: Record<string, NodeBlueprint>;
  export let state: EditorState | undefined = undefined;

  export let multiselect = true;
  
  export let appearance: 'light' | 'dark' | 'auto' = 'auto';
  export let style = '';

  export let onEditorContextMenu: ((event: MouseEvent) => void) | undefined = undefined;
  export let onNodeContextMenu: ((event: MouseEvent, node: Node) => void) | undefined = undefined;
  export let onReady: (() => void) | undefined = undefined;
  
  const appearanceClassName = getAppearance(appearance);
</script>

<div class={`function-junction-editor function-junction-appearance-${$appearanceClassName}`} {style}>
  <Nodes
    {nodes}
    {multiselect}
    bind:state
    on:ready
    {onEditorContextMenu}
    {onNodeContextMenu}
    {onReady}
  />
</div>