import React from 'react';
import { FJ } from '@function-junctions/react';

const NumberNode = ({
  outputs,
}: FJ.NodeProps<Record<string, never>, { Number: FJ.OutputSocket<number> }>) => {
  const { value, setValue } = outputs.Number;

  return (
    <input
      type="number"
      value={value}
      onChange={(event) => setValue(parseInt(event.currentTarget.value, 10))}
    />
  );
};

export default NumberNode;
