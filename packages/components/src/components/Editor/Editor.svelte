<script lang="ts">
  import { EditorState } from './index';

  import { NodeBlueprint } from '../Node';
  
  import Nodes from '../Nodes/Nodes.svelte';
  import { getAppearance } from '../Theme';

  import './Editor.scss';
  
  export let nodes: Record<string, NodeBlueprint>;
  export let state: EditorState | undefined = undefined;
  
  export let appearance: 'light' | 'dark' | 'auto' = 'auto';
  export let style = '';

  const appearanceClassName = getAppearance(appearance);
</script>

<div class={`function-junction-editor function-junction-appearance-${$appearanceClassName}`} {style}>
  <Nodes {nodes} bind:state on:ready />
</div>