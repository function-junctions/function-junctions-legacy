import React from 'react';
import { FJ } from '@/library';

const IncrementingNumberNode = ({
  outputs,
}: FJ.NodeProps<Record<string, never>, { Number: FJ.OutputSocket<number> }>) => {
  const { value, setValue } = outputs.Number;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue(value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [value, setValue]);

  return (
    <input
      type="number"
      value={value}
      onChange={(event) => setValue(parseInt(event.currentTarget.value, 10))}
    />
  );
};

export default IncrementingNumberNode;
