<script lang="ts">
  import { NodeBlueprint } from '../Node';
  
  import Nodes from '../Nodes/Nodes.svelte';

  import './Editor.scss';
  
  export let nodes: Record<string, NodeBlueprint>;
  export let style = '';
</script>

<div class="function-junction-editor" {style}>
  <Nodes {nodes} />
</div>