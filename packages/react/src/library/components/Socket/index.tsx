import React from 'react';
import { InternalInputSocket, InternalOutputSocket, InternalNode } from '@core/index';
import { Setter, Updater, useReadable, useWritable } from '../Hooks';
import { ReactComponent } from '../Editor';

export type InputSocket<T> = Omit<InternalInputSocket<T>, 'value'> & {
  value: T;
};

export type OutputSocket<T> = Omit<InternalOutputSocket<T>, 'value'> & {
  value: T;
  setValue: Setter<T>;
};

// This is a cheat to compensate for react's hook archetecture
export const OutputValueGenerator = ({
  value,
  id,
  nodeId,
  outputs,
  setReactOutputs,
  updateNodes,
}: { value: InternalOutputSocket<unknown>['value'] } & {
  id: string;
  nodeId: string;
  outputs: Record<string, InternalOutputSocket<any>>;
  updateNodes: Updater<
    Record<
      string,
      InternalNode<
        ReactComponent,
        React.CSSProperties,
        Record<string, InternalInputSocket<any>>,
        Record<string, InternalOutputSocket<any>>
      >
    >
  >;

  setReactOutputs: React.Dispatch<
    React.SetStateAction<Record<string, [unknown, Setter<unknown>, Updater<unknown>]> | undefined>
  >;
}) => {
  const [outputValue, setOutputValue] = useWritable(outputs[id].value);

  const destructuredValue = useWritable(value);
  const [destructuredValueValue, destructuredValueSetter, destructuredValueUpdater] =
    destructuredValue;

  React.useEffect(() => {
    setReactOutputs((prevOutputs) => ({
      ...prevOutputs,
      [id]: [destructuredValueValue, destructuredValueSetter, destructuredValueUpdater],
    }));
  }, [
    destructuredValueValue,
    destructuredValueSetter,
    destructuredValueUpdater,
    setReactOutputs,
    id,
  ]);

  React.useEffect(() => {
    if (outputs) setOutputValue(destructuredValueValue);
  }, [outputs, destructuredValueValue, setOutputValue]);

  React.useEffect(() => {
    updateNodes((prevNodes) => ({
      ...prevNodes,
      [nodeId]: {
        ...prevNodes[nodeId],
        outputs: {
          ...prevNodes[nodeId].outputs,
          [id]: {
            ...prevNodes[nodeId].outputs![id],
          },
        },
      },
    }));
  }, [id, nodeId, outputValue, updateNodes]);

  return <></>;
};

export const InputValueGenerator = ({
  value,
  id,
  setReactInputs,
}: { value: InternalInputSocket<unknown>['value'] } & {
  id: string;
  setReactInputs: React.Dispatch<React.SetStateAction<Record<string, unknown> | undefined>>;
}) => {
  const destructuredValue = useReadable(value);
  const destructuredValueValue = destructuredValue;

  React.useEffect(() => {
    setReactInputs((prevInputs) => ({
      ...prevInputs,
      [id]: destructuredValueValue,
    }));
  }, [destructuredValueValue, id, setReactInputs]);

  return <></>;
};
