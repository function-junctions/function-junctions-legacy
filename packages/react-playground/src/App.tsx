
import React from 'react';
import { Editor, FJ } from '@function-junctions/react';
import NumberNode from './components/NumberNode';
import MathNode from './components/MathNode';
import '@function-junctions/react/style.css';

function App() {
  const numberSocket: FJ.SocketBlueprint<number> = {
    type: 'number',
    defaultValue: 0,
  };

  const numberNode: FJ.NodeBlueprint<
    Record<string, never>,
    {
      Number: FJ.SocketBlueprint<number>;
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

  const [state, setState] = React.useState<FJ.EditorState | undefined>();

  React.useEffect(() => {
    console.log(state);
  }, [state]);
  
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
    />
  );
}

export default App;
