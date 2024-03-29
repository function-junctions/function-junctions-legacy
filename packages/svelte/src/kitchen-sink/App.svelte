<script lang="ts">
  import type { EditorState, SocketBlueprint } from 'core/index';

  import './App.scss';

  import { FJ, Editor } from '../library';

  import NumberNode from './components/NumberNode.svelte';
  import { writable } from 'svelte/store';
  import MathNode from './components/MathNode.svelte';

  import tree from './state.json';

  let state: EditorState = tree;

  const numberSocket: SocketBlueprint<number> = {
    type: 'number',
    defaultValue: 0,
  };

  const numberNode: FJ.NodeBlueprint<
    Record<string, never>,
    {
      Number: SocketBlueprint<number>;
    }
  > = {
    outputs: {
      Number: numberSocket,
    },
    component: NumberNode,
    color: 'linear-gradient(#228cfd, #007aff)',
  };

  const mathNode: FJ.NodeBlueprint<
    {
      LHS: SocketBlueprint<number>;
      RHS: SocketBlueprint<number>;
    },
    {
      Number: SocketBlueprint<number>;
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

  let editor: FJ.Editor;

  const value = writable();
  const Test = writable(2);

  $: console.log($value);
</script>

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
    items: [{ type: 'delete' }, { type: 'clone' }],
  }}
  bind:state
  bind:instance={editor}
/>
