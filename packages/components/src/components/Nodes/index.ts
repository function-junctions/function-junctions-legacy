import { get } from 'svelte/store';
import { DragInstance } from '../Drag';
import { addNode, NodeState } from '../Node';
import { InputSocketState, OutputSocketState } from '../Socket';
import { activeNodes, nodesState } from './store';

export type NodesState = Record<string, NodeState>;

export const onNodesWheel = (instance: DragInstance, event: WheelEvent): void => {
  event.preventDefault();

  const factor = 3.5;

  instance.zoom({
    deltaScale: Math.sign(event.deltaY) > 0 ? -factor : factor,
    x: event.pageX,
    y: event.pageY,
  });
};

export const onNodesPan = (instance: DragInstance, event: MouseEvent): void => {
  event.preventDefault();

  instance.panBy({
    originX: event.movementX,
    originY: event.movementY,
  });
};

export const restoreNodesState = (state: NodesState): void => Object.keys(state).forEach(
  (id) => addNode(state[id].type, { x: 0, y: 0 }, { id: parseInt(id, 10), blueprint: state[id] }),
);

export const updateNodesState = (): void => {
  const nodes = get(activeNodes);
  const state = get(nodesState);

  let newState: NodesState = {};

  Object.keys(nodes).forEach((id) => {
    newState = {
      ...newState,
      [id]: {
        ...state[id],
        x: nodes[id].x,
        y: nodes[id].y,
        inputs: {
          ...state[id].inputs,
          ...(() => {
            let inputs: Record<string, InputSocketState> = {};

            Object.keys(nodes[id]?.inputs ?? {}).forEach((inputId) => {
              const value = nodes[id].inputs?.[inputId].value;
              const type = nodes[id].inputs?.[inputId].type ?? '';
              const connection = nodes[id].inputs?.[inputId]?.connection;
  
              inputs = {
                ...inputs,
                [inputId]: {
                  type,
                  value: value ? get(value) : undefined,
                  connection: connection ? get(connection) : undefined,
                },
              };
            });

            return inputs;
          })(),
        },
        outputs: {
          ...state[id].outputs,
          ...(() => {
            let outputs: Record<string, OutputSocketState> = {};

            Object.keys(nodes[id]?.outputs ?? {}).forEach((outputId) => {
              const value = nodes[id].outputs?.[outputId].value;
              const type = nodes[id].outputs?.[outputId].type ?? '';
  
              outputs = {
                ...outputs,
                [outputId]: {
                  type,
                  value: value ? get(value) : undefined,
                },
              };
            });

            return outputs;
          })(),
        },
      },
    };
  });

  nodesState.set(newState);
};