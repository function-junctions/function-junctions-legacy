<style lang="scss" global>
  @import './Editor.scss';
</style>

<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  // Editor must be imported as EditorClass or svelte package fails to
  // properly type props
  import { type EditorState, Editor as EditorClass } from '.';
  import type { EditorContextMenuBlueprint, NodeContextMenuBlueprint } from '../ContextMenu';

  import type { NodeBlueprint } from '../Nodes';
  import Nodes from '../Nodes/Nodes.svelte';
    
  import { getAppearance } from '../Theme';
    
  export let nodes: Record<string, NodeBlueprint>;
  export let state: EditorState | undefined = undefined;

  export let inputs: Record<string, Writable<unknown>> | undefined = undefined;
  export let outputs: Record<string, Writable<unknown>> | undefined = undefined;
    
  export let multiselect = true;
  export let zoomable = true;
  export let pannable = true;
  export let moveable = true;
  export let interactable = true;
    
  export let editable = true;

  export let editorContextMenu: EditorContextMenuBlueprint | ((event: MouseEvent) => void) | undefined = undefined;
  export let nodeContextMenu: NodeContextMenuBlueprint | ((ids: string[], event: MouseEvent) => void )| undefined = undefined;
    
  export let appearance: 'light' | 'dark' | 'auto' = 'auto';

  export let instance = new EditorClass(writable(nodes), state, !editable, inputs, outputs);

  export let onReady: ((editor: EditorClass) => void) | undefined = undefined;
    
  const appearanceClassName = getAppearance(appearance);

  const { readonly } = instance;

  $: editable = $readonly;
</script>

<div class={`function-junctions-editor function-junctions-appearance-${$appearanceClassName}`} {...$$restProps}>
  <Nodes
    editor={instance}
    {multiselect}
    {zoomable}
    {pannable}
    {moveable}
    {interactable}
    {editorContextMenu}
    {nodeContextMenu}
    {onReady}
    bind:state
  />
</div>