import { NodeBlueprint } from '@/library/Node';
import { SocketBlueprint } from 'core/types';
import React from 'react';
import Editor from '../library/Editor/Editor';
import NumberNode from './components/NumberNode';
import MathNode from './components/MathNode';

import 'core/index.scss';

function App() {
  const numberSocket: SocketBlueprint<number> = {
    type: 'number',
    defaultValue: 0,
  };

  const numberNode: NodeBlueprint<
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

  const mathNode: NodeBlueprint<
    {
      LHS: SocketBlueprint<number>;
      RHS: SocketBlueprint<number>;
    },
    { Number: SocketBlueprint<number> }
  > = {
    inputs: {
      LHS: numberSocket,
      RHS: numberSocket,
    },
    outputs: {
      Number: numberSocket,
    },
    // @ts-expect-error
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
    />
  );
}

export default App;
