import {
  InternalNodeBlueprint,
  InternalNode,
  InternalNodeProps,
  SocketBlueprint,
} from '@core/index';
import React from 'react';
import { ReactComponent } from '../Editor';
import { InputSocket, OutputSocket } from '../Socket';

export type NodeBlueprint<
  I = Record<string, SocketBlueprint>,
  O = Record<string, SocketBlueprint>,
  S = Record<string, any>,
> = InternalNodeBlueprint<ReactComponent, React.CSSProperties, I, O, S>;

export type Node = InternalNode<ReactComponent, React.CSSProperties>;

export type NodeProps<
  I extends Record<string, InputSocket<any> | never> = any,
  O extends Record<string, OutputSocket<any> | never> = any,
  S = Record<string, any>,
> = Omit<InternalNodeProps<ReactComponent, React.CSSProperties>, 'outputs' | 'inputs'> & {
  inputs: I;
  outputs: O;
  store: S;
  setStore: React.Dispatch<React.SetStateAction<S>>;
};
