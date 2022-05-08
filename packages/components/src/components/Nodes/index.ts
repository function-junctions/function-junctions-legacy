import { Writable, writable } from 'svelte/store';
import { Node } from '../Node';

export const nodesRegistry: Writable<Record<string, Node>> = writable({});