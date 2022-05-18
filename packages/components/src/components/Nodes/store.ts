import { Writable, writable } from 'svelte/store';
import { NodesState } from '.';
import { DragPoints } from '../Drag';
import { Node, NodeBlueprint } from '../Node';

export const registeredNodes: Writable<Record<string, NodeBlueprint>> = writable({});
export const activeNodes: Writable<Record<string, Node>> = writable({});

export const nodeMoving = writable<boolean>(false);
export const nodesContainerMoving = writable<boolean>(false);
export const selectedNodes = writable<string[]>([]);
export const lastSelectedNode = writable<string>();

export const nodesCoordinates: Writable<DragPoints> = writable({
  left: 0,
  top: 0,
  originX: 0,
  originY: 0,
  translateX: 0,
  translateY: 0,
  scale: 1,
});

export const nodesState = writable<NodesState>({});

export const nodesStateRestored = writable(false);