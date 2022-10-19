import { NodeProps } from 'core/components/Node';
import type { InternalNodeBlueprint, InternalNode } from 'core/components/Nodes';
import { SocketBlueprint } from 'core/index';
import React from 'react';
import { ReactComponent } from '../Editor';
import { ReactInputSocket, ReactOutputSocket } from '../Socket';

export type NodeBlueprint<
  I = Record<string, SocketBlueprint>,
  O = Record<string, SocketBlueprint>,
  S = Record<string, any>,
> = InternalNodeBlueprint<ReactComponent, React.CSSProperties, I, O, S>;

export type Node = InternalNode<ReactComponent, React.CSSProperties>;

export type ReactNodeProps<
  I extends Record<string, ReactInputSocket<any> | never> = any,
  O extends Record<string, ReactOutputSocket<any> | never> = any,
  S = Record<string, any>,
> = Omit<NodeProps<ReactComponent, React.CSSProperties>, 'outputs' | 'inputs'> & {
  inputs: I;
  outputs: O;
  store: S;
  setStore: React.Dispatch<React.SetStateAction<S>>;
};
