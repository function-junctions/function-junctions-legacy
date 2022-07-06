<script lang="ts">
  import type {
    EditorState,
    NodeBlueprint,
    SocketBlueprint,
    Editor as EditorType,
  } from '../library/types';
  import { App } from 'framework7-svelte';

  import './App.scss';

  import { Editor } from '../library';

  import NumberNode from './components/NumberNode.svelte';
  import { writable } from 'svelte/store';
  import MathNode from './components/MathNode.svelte';
  import SqrtNode from './components/SqrtNode.svelte';

  import tree from './state.json';

  let state: EditorState = tree;

  const numberSocket: SocketBlueprint<number> = {
    type: 'number',
    defaultValue: 0,
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
  }, {
    Number: SocketBlueprint<number>
  }> = {
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

  const sqrtNode: NodeBlueprint<{
    BASE: SocketBlueprint<number>
    POWER: SocketBlueprint<number>
  }, {
    Number: SocketBlueprint<number>
  }> = {
    inputs: {
      BASE: numberSocket,
      POWER: numberSocket,
    },
    outputs: {
      Number: numberSocket,
    },
    component: SqrtNode,
    color: 'linear-gradient(#ff5776, #ff2d55)',
  };

  const nodes = {
    Number: numberNode,
    Math: mathNode,
    Sqrt: sqrtNode,
  };

  let editor: EditorType;

  const value = writable();
  const Test = writable(2);

  $: console.log($value);
</script>

<App {...{
  theme: 'ios',
  autoDarkMode: true,
  name: 'Kitchen Sink',
}}>
  <Editor
    {nodes}
    inputs={{
      Test: {
        type: 'number',
        value: Test,
      },
    }}
    outputs={{
      value: {
        type: 'number',
        value,
      },
    }}
    editorContextMenu={{
      nodes: true,
    }}
    nodeContextMenu={{
      items: [
        { type: 'delete' },
        { type: 'clone' },
      ],
    }}
    bind:state
    bind:instance={editor}
  />
</App>
