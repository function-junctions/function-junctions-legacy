<script lang="ts">
  import type { NodeBlueprint, SocketBlueprint } from '@function-junction/components/src/components';

  import './App.scss';

  import Editor from '@function-junction/components/src/components/Editor/Editor.svelte';

  import NumberNode from './components/NumberNode.svelte';
  import MathNode from './components/MathNode.svelte';

  const numberSocket: SocketBlueprint<number> = {
    type: 'number',
    defaultValue: 0,
    color: '#ff2d55',
  };
  
  const numberNode: NodeBlueprint<Record<string, never>,
    {
      Number: SocketBlueprint<number>
    }> = {
      outputs: {
        Number: numberSocket,
      },
      component: NumberNode,
      color: 'linear-gradient(#228cfd, #007aff)',
    };

  const mathNode: NodeBlueprint<{
    LHS: SocketBlueprint<number>
    RHS: SocketBlueprint<number>
  },
    {
      Number: SocketBlueprint<number>
    }
    > = {
      inputs: {
        LHS: numberSocket,
        RHS: numberSocket,
      },
      outputs: {
        Number: numberSocket,
      },
      component: MathNode,
      color: 'linear-gradient(#ff5776, #ff2d55)',
    };

  const nodes = {
    Number: numberNode,
    Math: mathNode,
    Test: mathNode,
  };

</script>

<Editor {nodes} />
