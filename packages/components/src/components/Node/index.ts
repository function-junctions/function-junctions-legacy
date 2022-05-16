import { SvelteComponentDev } from 'svelte/internal';
import { get } from 'svelte/store';
import { Point } from '../../types';
import {
  createInputSocket,
  createOutputSocket,
  InputSocket,
  InputSocketState,
  OutputSocket,
  OutputSocketState,
} from '../Socket';
import { InputSockets, OutputSockets } from '../Sockets';
import { SocketBlueprint } from '../Socket';
import {
  nodeMoving,
  nodesCoordinates,
  activeNodes,
  selectedNode,
  registeredNodes,
  nodesState,
} from '../Nodes/store';
import { uniqueNodeId } from './store';

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
};

export type NodeState = Point & {
  type: string;
  inputs?: Record<string, InputSocketState>;
  outputs?: Record<string, OutputSocketState>;
}

export type OnNodeDrag = (id: string, event: MouseEvent) => void;

export const getUniqueNodeId = (nodeKeys: string[]): void => {
  const id = get(uniqueNodeId);
  
  if (nodeKeys.map((key) => parseInt(key, 10)).some((key) => key === id)) {
    uniqueNodeId.set(id + 1);
    getUniqueNodeId(nodeKeys);
  } 
};

export const addNode = (key: string, state?: { id: number; blueprint: NodeState; }): void => {
  const blueprint = get(registeredNodes)?.[key];
  const nodes = get(activeNodes);

  getUniqueNodeId(Object.keys(nodes));
  const id = state?.id ?? get(uniqueNodeId);

  const x = state?.blueprint.x ?? 0;
  const y = state?.blueprint.y ?? 0;

  const newState: NodeState = {
    type: key,
    x,
    y,
  };

  if (blueprint) {
    // Add node to active nodes list
    activeNodes.set({
      ...nodes,
      [id]: {
        inputs: (() => {
          const inputs: InputSockets<Record<string, any>> = {};
      
          if (blueprint.inputs) {
            Object.keys(blueprint.inputs ?? {}).map((inputKey) => {
              const inputBlueprint = blueprint.inputs?.[inputKey];
              const inputState = state?.blueprint.inputs?.[inputKey];

              if (inputBlueprint) {
                const type = inputBlueprint.type;
                const defaultValue = inputBlueprint?.defaultValue;
                const connection = state?.blueprint.inputs?.[inputKey].connection;

                newState.inputs = {
                  ...newState.inputs,
                  [inputKey]: {
                    type,
                    value: defaultValue,
                    connection,
                  },
                };

                inputs[inputKey] = createInputSocket(
                  type,
                  defaultValue,
                  {
                    connection,
                    value: inputState?.value,
                  },
                );
              }
            });
          }
      
          return Object.keys(inputs).length > 0 ? inputs : undefined;
        })(),
        outputs: (() => {
          const outputs: OutputSockets<Record<string, any>> = {};
          
          if (blueprint.outputs) {
            Object.keys(blueprint.outputs ?? {}).map((outputKey) => {
              const outputBlueprint = blueprint.outputs?.[outputKey];
              const outputState = state?.blueprint.outputs?.[outputKey];

              if (outputBlueprint) {
                const type = outputBlueprint.type;
                const defaultValue = outputState?.value ?? outputBlueprint?.defaultValue;

                newState.outputs = {
                  ...newState.outputs,
                  [outputKey]: {
                    type,
                    value: defaultValue,
                  },
                };

                outputs[outputKey] = createOutputSocket(type, defaultValue);
              }
            });
          }
          return Object.keys(outputs).length > 0 ? outputs : undefined;
        })(),
        type: key,
        x,
        y,
        component: blueprint.component,
        color: blueprint.color,
      },
    });

    nodesState.update((prevNodesState) => ({
      ...prevNodesState,
      [id]: newState,
    }));
  }
};

export const onNodeDrag: OnNodeDrag = (id, event) => {
  if (get(nodeMoving) && get(selectedNode) === id) {
    const node = get(activeNodes)[id];

    // Get z coordinate to determine scale so nodes travel faster with scale
    const { scale } = get(nodesCoordinates);

    if (node) {
      activeNodes.set({
        ...get(activeNodes),
        [id]: {
          ...node,
          x: node.x + event.movementX / scale,
          y: node.y + event.movementY / scale,
        },
      });
    }
  }
};