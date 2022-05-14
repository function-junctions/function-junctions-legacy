import { Writable, writable } from 'svelte/store';
import { DragPoints } from '../Drag';
import { Node } from '../Node';

export const nodesRegistry: Writable<Record<string, Node>> = writable({});
export const nodeMoving = writable<boolean>(false);
export const nodesContainerMoving = writable<boolean>(false);
export const selectedNode = writable<string>();

export const nodesCoordinates: DragPoints = writable({
  left: 0,
  top: 0,
  originX: 0,
  originY: 0,
  translateX: 0,
  translateY: 0,
  scale: 1,
});

export const onNodesWheel = (instance: any, event: WheelEvent): void => {
  event.preventDefault();

  instance.zoom({
    deltaScale: Math.sign(event.deltaY) > 0 ? -1 : 1,
    x: event.pageX,
    y: event.pageY,
  });

};

export const onNodesPan = (instance: any, event: MouseEvent): void => {
  event.preventDefault();

  instance.panBy({
    originX: event.movementX,
    originY: event.movementY,
  });
};