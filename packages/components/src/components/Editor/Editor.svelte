<script lang="ts">
  import { NodeBlueprint } from '../Node';
  
  import Nodes from '../Nodes/Nodes.svelte';
  import { getAppearance } from '../Theme';

  import './Editor.scss';
  
  export let nodes: Record<string, NodeBlueprint>;
  
  export let appearance: 'light' | 'dark' | 'auto' = 'auto';
  export let style = '';

  const appearanceClassName = getAppearance(appearance);
</script>

<div class={`function-junction-editor function-junction-appearance-${$appearanceClassName}`} {style}>
  <Nodes {nodes} />
</div>