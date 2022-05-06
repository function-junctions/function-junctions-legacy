import { SvelteComponentDev } from 'svelte/internal';
import { writable } from 'svelte/store';
import { Point } from '../../types';
import { InputSocket, OutputSocket } from '../Socket';
import { InputSockets, OutputSockets } from '../Sockets';

export interface NodeComponentProps<I, O> extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap['div']> {
  inputs: I;
  outputs: O;
}

export type Node<
  I extends Record<string, { type: string; defaultValue?: any }> = Record<string, { type: string; defaultValue?: any }>,
  O extends Record<string, { type: string; defaultValue?: any }> = Record<string, { type: string; defaultValue?: any }>
> = {
  inputs?: I;
  outputs?: O;
  component: typeof SvelteComponentDev;
}

export type RegisteredNode<
  I extends InputSockets<Record<string, InputSocket<any>>> = Record<string, InputSocket<any>>,
  O extends OutputSockets<Record<string, OutputSocket<any>>> = Record<string, OutputSocket<any>>
> = Point & {
  inputs?: I;
  outputs?: O;
  component: typeof SvelteComponentDev;
  type: string;
}

export const uniqueNodeId = writable(0);

export const getUniqueActiveNodeId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);