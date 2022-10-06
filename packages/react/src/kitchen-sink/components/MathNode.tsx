import React from 'react';
import { ReactNodeProps } from '@/library/Node';
import { ReactInputSocket, ReactOutputSocket } from '@/library/Socket';

const MathNode = ({
  inputs,
  outputs,
  store = {
    type: 'addition',
  },
}: ReactNodeProps<
  {
    LHS: ReactInputSocket<number>;
    RHS: ReactInputSocket<number>;
  },
  { Number: ReactOutputSocket<number> },
  { type: 'addition' | 'subtraction' | 'multiplication' | 'division' }
>) => {
  const { value: LHS } = inputs.LHS;
  const { value: RHS } = inputs.RHS;

  const { value: output, setValue: setOutput } = outputs.Number;

  React.useEffect(() => {
    const { type } = store;

    switch (type) {
      case 'addition':
        setOutput(LHS + RHS);
        break;
      case 'subtraction':
        setOutput(LHS - RHS);
        break;
      case 'multiplication':
        setOutput(LHS * RHS);
        break;
      case 'division':
        setOutput(LHS / RHS);
        break;
      default:
        setOutput(LHS + RHS);
        break;
    }
  }, [LHS, RHS, setOutput, store]);

  return (
    <>
      <h1 style={{ textAlign: 'center' }}>{output}</h1>
      <select value={store.type}>
        <option value="addition">Addition</option>
        <option value="subtraction">Subtraction</option>
        <option value="multiplication">Multiplication</option>
        <option value="division">Division</option>
      </select>
    </>
  );
};

export default MathNode;
