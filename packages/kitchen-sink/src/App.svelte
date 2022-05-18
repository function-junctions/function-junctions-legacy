<script lang="ts">
  import {
    addNode,
    NodeBlueprint,
    SocketBlueprint,
  } from '@function-junction/components/src/components';
  import type { EditorState } from '@function-junction/components/src/components/Editor';

  import './App.scss';

  import Editor from '@function-junction/components/src/components/Editor/Editor.svelte';

  import NumberNode from './components/NumberNode.svelte';
  import MathNode from './components/MathNode.svelte';

  import serializedState from './state.json';

  let state: EditorState = serializedState;

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
  };
</script>

<Editor
  {nodes}
  bind:state
  onEditorContextMenu={(event) => {
    event.preventDefault();

    addNode('Math', { x: event.clientX, y: event.clientY });
  }}
  onNodeContextMenu={() => console.log('node contextmenu')}
/>
