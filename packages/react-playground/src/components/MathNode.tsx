import React from 'react';
import { FJ } from '@function-junctions/react';

const MathNode = ({
  inputs,
  outputs,
  store = {
    type: 'addition',
  },
  setStore,
}: FJ.NodeProps<
  {
    LHS: FJ.InputSocket<number>;
    RHS: FJ.InputSocket<number>;
  },
  { Number: FJ.OutputSocket<number> },
  { type?: 'addition' | 'subtraction' | 'multiplication' | 'division' }
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
      <select
        value={store.type}
        onChange={(event) =>
          setStore((prevStore) => ({
            ...prevStore,
            type: event.currentTarget.value as
              | 'addition'
              | 'subtraction'
              | 'multiplication'
              | 'division',
          }))
        }
      >
        <option value="addition">Addition</option>
        <option value="subtraction">Subtraction</option>
        <option value="multiplication">Multiplication</option>
        <option value="division">Division</option>
      </select>
    </>
  );
};

export default MathNode;
