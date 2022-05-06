<script lang="ts">
  import type { Node } from '@function-junction/components/src/components';

  import Nodes from '@function-junction/components/src/components/Nodes/Nodes.svelte';

  import NumberNode from './components/NumberNode.svelte';
  import MathNode from './components/MathNode.svelte';
  
  const numberNode: Node<Record<string, never>, { Number: { type: 'number', defaultValue: number } }> = {
    outputs: {
      Number: {
        type: 'number',
        defaultValue: 5,
      },
    },
    component: NumberNode,
  };

  const mathNode: Node<{ Number: { type: 'number' } }, { Number: { type: 'number' } }> = {
    inputs: {
      Number: {
        type: 'number',
      },
    },
    outputs: {
      Number: {
        type: 'number',
      },
    },
    component: MathNode,
  };

  const nodes = {
    Number: numberNode,
    Math: mathNode,
  };

</script>

<Nodes {nodes} />
