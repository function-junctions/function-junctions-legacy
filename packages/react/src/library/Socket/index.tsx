import React from 'react';
import { InputSocket, OutputSocket } from 'core/components/Sockets';
import { Setter, Updater, useReadable, useWritable } from '../Hooks';
import { InternalNode } from 'core/index';
import { ReactComponent } from '../Editor';

export type ReactInputSocket<T> = Omit<InputSocket<T>, 'value'> & {
  value: T;
};

export type ReactOutputSocket<T> = Omit<OutputSocket<T>, 'value'> & {
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
}: { value: OutputSocket<unknown>['value'] } & {
  id: string;
  nodeId: string;
  outputs: Record<string, OutputSocket<any>>;
  updateNodes: Updater<
    Record<
      string,
      InternalNode<
        ReactComponent,
        React.CSSProperties,
        Record<string, InputSocket<any>>,
        Record<string, OutputSocket<any>>
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
            value: outputs[id].value,
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
}: { value: InputSocket<unknown>['value'] } & {
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
