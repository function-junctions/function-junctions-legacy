import { Writable, writable } from 'svelte/store';
import { Node } from '../Node';

export const nodesRegistry: Writable<Record<string, Node>> = writable({});
export const nodeMoving = writable<boolean>(false);
export const selectedNode = writable<string>();