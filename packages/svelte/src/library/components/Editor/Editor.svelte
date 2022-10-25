<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  // Editor must be imported as EditorClass or svelte package fails to
  // properly type props
  import {
    type EditorState,
    type EditorContextMenuProp,
    type NodeContextMenuProp,
    type NodeControlButtons,
    getAppearance,
  } from 'core/index';

  import type { NodeBlueprint } from '../Node';
  import Nodes from '../Nodes/Nodes.svelte';

  import { Editor } from '.';

  export let nodes: Record<string, NodeBlueprint>;
  export let state: EditorState | undefined = undefined;

  export let inputs: Record<string, { type: string; value: Writable<unknown> }> | undefined =
    undefined;
  export let outputs: Record<string, { type: string; value: Writable<unknown> }> | undefined =
    undefined;

  export let multiselect = true;
  export let zoomable = true;
  export let pannable = true;
  export let moveable = true;
  export let interactable = true;

  export let editable = true;

  export let editorContextMenu: EditorContextMenuProp = undefined;
  export let nodeContextMenu: NodeContextMenuProp = undefined;
  export let nodeControlButtons: NodeControlButtons | boolean = {
    delete: true,
    clone: true,
  };

  export let appearance: 'light' | 'dark' | 'auto' = 'auto';

  export let instance: Editor = new Editor({
    blueprint: writable(nodes),
    state,
    readonly: !editable,
    inputs,
    outputs,
  });

  export let onReady: ((editor: Editor) => void) | undefined = undefined;

  const appearanceClassName = getAppearance(appearance);

  $: instance.inputs = inputs;
  $: instance.outputs = outputs;
</script>

<div
  class={`function-junctions-editor function-junctions-appearance-${$appearanceClassName}`}
  {...$$restProps}
>
  <Nodes
    editor={instance}
    {multiselect}
    {zoomable}
    {pannable}
    {moveable}
    {interactable}
    {editorContextMenu}
    {nodeContextMenu}
    {nodeControlButtons}
    {onReady}
    bind:state
  />
</div>
