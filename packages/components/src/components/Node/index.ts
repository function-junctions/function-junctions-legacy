import { SvelteComponentDev } from 'svelte/internal';
import { get, writable } from 'svelte/store';
import { Point } from '../../types';
import {
  createInputSocket,
  createOutputSocket,
  InputSocket,
  OutputSocket,
} from '../Socket';
import { InputSockets, OutputSockets } from '../Sockets';
import { SocketBlueprint } from '../Socket';
import { nodeMoving, nodesRegistry, selectedNode } from '../Nodes';

export type NodeBlueprint<
  I extends Record<string, SocketBlueprint> = Record<string, SocketBlueprint>,
  O extends Record<string, SocketBlueprint> = Record<string, SocketBlueprint>
> = {
  inputs?: I;
  outputs?: O;
  color?: string;
  component: typeof SvelteComponentDev;
}

export type Node<
  I extends InputSockets<Record<string, InputSocket<any>>> = Record<string, InputSocket<any>>,
  O extends OutputSockets<Record<string, OutputSocket<any>>> = Record<string, OutputSocket<any>>
> = Point & {
  inputs?: I;
  outputs?: O;
  component: typeof SvelteComponentDev;
  type: string;
  color?: string;
}

export type OnNodeDrag = (id: string, event: MouseEvent) => void;

export const uniqueNodeId = writable(0);

export const createNode = (type: string, blueprint: NodeBlueprint): Node => ({
  inputs: (() => {
    const inputs: InputSockets<Record<string, any>> = {};

    if (blueprint.inputs) {
      Object.keys(blueprint.inputs ?? {}).map((inputKey) => {
        const inputBlueprint = blueprint.inputs?.[inputKey];
        if (inputBlueprint)
          inputs[inputKey] = createInputSocket(inputBlueprint.type, inputBlueprint?.defaultValue);
      });
    }

    return Object.keys(inputs).length > 0 ? inputs : undefined;
  })(),
  outputs: (() => {
    const outputs: OutputSockets<Record<string, any>> = {};

    if (blueprint.outputs) {
      Object.keys(blueprint.outputs ?? {}).map((inputKey) => {
        const outputBlueprint = blueprint.outputs?.[inputKey];
        if (outputBlueprint)
          outputs[inputKey] = createOutputSocket(outputBlueprint.type, outputBlueprint?.defaultValue);
      });
    }
    return Object.keys(outputs).length > 0 ? outputs : undefined;
  })(),
  type,
  x: 0,
  y: 0,
  z: 0,
  component: blueprint.component,
  color: blueprint.color,
});

export const onNodeDrag: OnNodeDrag = (id, event) => {
  if (get(nodeMoving) && get(selectedNode) === id) {
    const node = get(nodesRegistry)[id];

    if (node) {
      nodesRegistry.set({
        ...get(nodesRegistry),
        [id]: {
          ...node,
          x: node.x + event.movementX,
          y: node.y + event.movementY,
        },
      });
    }
  }
};