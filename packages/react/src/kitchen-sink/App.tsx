import { NodeBlueprint } from '@/library/components/Node';
import { FJ } from '@/library';
import React from 'react';
import Editor from '../library/components/Editor/Editor';
import NumberNode from './components/NumberNode';
import MathNode from './components/MathNode';

import 'core/index.scss';

function App() {
  const numberSocket: FJ.SocketBlueprint<number> = {
    type: 'number',
    defaultValue: 0,
  };

  const numberNode: NodeBlueprint<
    Record<string, never>,
    {
      Number: FJ.SocketBlueprint<number>;
    }
  > = {
    outputs: {
      Number: numberSocket,
    },
    title: 'Testing',
    component: NumberNode,
    color: 'linear-gradient(#228cfd, #007aff)',
  };

  const mathNode: NodeBlueprint<
    {
      LHS: FJ.SocketBlueprint<number>;
      RHS: FJ.SocketBlueprint<number>;
    },
    { Number: FJ.SocketBlueprint<number> },
    { type: 'addition' | 'subtraction' | 'multiplication' | 'division' }
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

  return (
    <Editor
      nodes={nodes}
      editorContextMenu={{
        nodes: true,
      }}
      nodeContextMenu={{
        items: [{ type: 'delete' }, { type: 'clone' }],
      }}
      onReady={(editor) => console.log(editor)}
    />
  );
}

export default App;
