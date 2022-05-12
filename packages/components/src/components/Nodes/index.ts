import { get, Writable, writable } from 'svelte/store';
import { Point } from '../../types';
import { Node } from '../Node';

export const nodesRegistry: Writable<Record<string, Node>> = writable({});
export const nodeMoving = writable<boolean>(false);
export const nodesContainerMoving = writable<boolean>(false);
export const selectedNode = writable<string>();

export const nodesCoordinates = writable<Point & { z: number }>({ x: 0, y: 0, z: 1 });

const pos = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
let scale = 1;
const speed = 0.1;

export const onNodesWheel = (event: WheelEvent): void => {
  event.preventDefault();

  target.x = (event.clientX - pos.x) / scale;
  target.y = (event.clientY - pos.y) / scale;
 
  scale += -1 * Math.max(-1, Math.min(1, event.deltaY)) * speed * scale;

  pos.x = -target.x * scale + event.clientX;
  pos.y = -target.y * scale + event.clientY;

  nodesCoordinates.set({
    x: pos.x,
    y: pos.x,
    z: scale,
  });

  console.log(get(nodesCoordinates));
};

export const onNodesPan = (ref: HTMLDivElement, event: MouseEvent): void => {
  event.preventDefault();
  pos.x = (pos.x + event.movementX);
  pos.y = (pos.y + event.movementY);

  nodesCoordinates.set({
    ...get(nodesCoordinates),
    x: pos.x,
    y: pos.y,
  });

  console.log(get(nodesCoordinates));
};