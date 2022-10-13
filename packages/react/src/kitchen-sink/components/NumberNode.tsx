import React from 'react';
import { ReactNodeProps } from '@/library/Node';
import { ReactOutputSocket } from '@/library/Socket';

const NumberNode = ({
  outputs,
}: ReactNodeProps<Record<string, never>, { Number: ReactOutputSocket<number> }>) => {
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