import { Writable, writable } from 'svelte/store';
import { RegisteredNode } from '../Node';

export const nodesRegistry: Writable<Record<string, RegisteredNode>> = writable({});