import { NodeBlueprint } from '@/library/components/Node';
import { FJ } from '@/library';
import React from 'react';
import Editor from '../library/components/Editor/Editor';
import NumberNode from './components/NumberNode';
import MathNode from './components/MathNode';

import '@core/index.scss';

import tree from './state.json';
import IncrementingNumberNode from './components/IncrementingNumberNode';

function App() {
  const [state, setState] = React.useState<FJ.EditorState | undefined>(tree);

  const numberSocket: FJ.SocketBlueprint<number> = React.useMemo(
    () => ({
      type: 'number',
      defaultValue: 0,
    }),
    [],
  );

  const numberNode: NodeBlueprint<
    Record<string, never>,
    {
      Number: FJ.SocketBlueprint<number>;
    }
  > = React.useMemo(
    () => ({
      outputs: {
        Number: numberSocket,
      },
      component: NumberNode,
      color: 'linear-gradient(#228cfd, #007aff)',
    }),
    [numberSocket],
  );

  const incrementingNumberNode: NodeBlueprint<
    Record<string, never>,
    {
      Number: FJ.SocketBlueprint<number>;
    }
  > = React.useMemo(
    () => ({
      outputs: {
        Number: numberSocket,
      },
      component: IncrementingNumberNode,
      color: 'linear-gradient(#228cfd, #007aff)',
    }),
    [numberSocket],
  );

  const mathNode: NodeBlueprint<
    {
      LHS: FJ.SocketBlueprint<number>;
      RHS: FJ.SocketBlueprint<number>;
    },
    { Number: FJ.SocketBlueprint<number> },
    { type: 'addition' | 'subtraction' | 'multiplication' | 'division' }
  > = React.useMemo(
    () => ({
      inputs: {
        LHS: numberSocket,
        RHS: numberSocket,
      },
      outputs: {
        Number: numberSocket,
      },
      component: MathNode,
      color: 'linear-gradient(#ff5776, #ff2d55)',
    }),
    [numberSocket],
  );

  const nodes = React.useMemo(
    () => ({
      Number: numberNode,
      Math: mathNode,
      'Incrementing Number': incrementingNumberNode,
    }),
    [mathNode, numberNode, incrementingNumberNode],
  );

  const onReady = React.useCallback((editor: FJ.Editor) => {
    editor.addNode('Number').then(({ id }) => {
      editor
        .updateNode(id, {
          title: 'New Test',
        })
        .then((node) => {
          console.log(node);
        });
    });
  }, []);

  return (
    <Editor
      nodes={nodes}
      editorContextMenu={{
        nodes: true,
      }}
      nodeContextMenu={{
        items: [{ type: 'delete' }, { type: 'clone' }],
      }}
      state={state}
      setState={setState}
      onReady={onReady}
    />
  );
}

export default App;
