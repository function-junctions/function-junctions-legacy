<script lang="ts">
  import type { FunctionJunctionEditor } from '.';
  import type { FunctionJunctionNode } from '../Node';

  export let style = '';
  
  let editor: FunctionJunctionEditor = {
    x: 0,
    y: 0,
    scale: 0,
  };

  let nodes: FunctionJunctionNode[] = [];
</script>

<div class="function-junction-editor" {style}>
  <div
    class="function-junction-editor-container"
    style={`transform: translate(${editor.x}px, ${editor.y}px) scale(${editor.scale})`}
  />
</div>