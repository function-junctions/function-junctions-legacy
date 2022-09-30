import React from 'react';
import { InputSocket, OutputSocket } from 'core/components/Sockets';
import { Setter, Updater, useReadable, useWritable } from '../Hooks';

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
  get,
}: { value: OutputSocket<any>['value'] } & {
  get: (destructuredValue: [unknown, Setter<unknown>, Updater<unknown>]) => void;
}) => {
  const destructuredValue = useWritable(value);

  React.useEffect(() => {
    get(destructuredValue);
  }, [destructuredValue, get]);

  return <></>;
};

export const InputValueGenerator = ({
  value,
  get,
}: { value: InputSocket<any>['value'] } & {
  get: (destructuredValue: unknown) => void;
}) => {
  const destructuredValue = useReadable(value);

  React.useEffect(() => {
    get(destructuredValue);
  }, [destructuredValue, get]);

  return <></>;
};
