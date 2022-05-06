import { InputSocket, OutputSocket } from '../Socket';

export type InputSockets<T extends Record<string, InputSocket<any>>> = T;
export type OutputSockets<T extends Record<string, OutputSocket<any>>> = T;