import { tick } from 'svelte/internal';
import { get, type Writable } from 'svelte/store';
import type { Point } from '../..';
import type { Position } from '../Drag';
import deepmerge from 'deepmerge';
import {
  type InternalInputSocketState,
  type LiveConnection,
  type InternalOutputSocketState,
  type SocketBlueprint,
  Sockets,
  InternalInputSocket,
  InternalOutputSocket,
} from '../Sockets';

export type InternalNodeBlueprint<
  C,
  S,
  I = Record<string, SocketBlueprint>,
  O = Record<string, SocketBlueprint>,
  ST = Record<string, any>,
> = {
  inputs?: I;
  outputs?: O;
  title?: string;
  color?: string;
  className?: string;
  store?: ST;
  style?: S;
  component: C;
  deletable?: boolean;
  cloneable?: boolean;
  interactable?: boolean;
};

export type InternalNode<
  C,
  S = string,
  I = Record<string, InternalInputSocket<any>>,
  O = Record<string, InternalOutputSocket<any>>,
  ST = Record<string, unknown>,
> = Point &
  InternalNodeBlueprint<C, S, I, O, ST> & {
    type: string;
  };

export type NodeState = Point & {
  type: string;
  inputs?: Record<string, InternalInputSocketState>;
  outputs?: Record<string, InternalOutputSocketState>;
  store?: Record<string, unknown>;
};

export type CurrentNodes<C, S> = {
  registered: Writable<Record<string, InternalNodeBlueprint<C, S>>>;
  current: Writable<Record<string, InternalNode<C, S>>>;
};

export type NodesState = {
  nodes: Writable<Record<string, NodeState>>;
  restored: Writable<boolean>;
};

export type NodeConnection = {
  nodeId: string;
  socketId: string;
};

export type NodeOptions<S = string> = {
  title?: string;
  color?: string;
  className?: string;
  store?: Record<string, unknown>;
  style?: S;
  deletable?: boolean;
  cloneable?: boolean;
  interactable?: boolean;
  position?: Point;
  id?: string;
  inputs?: Record<string, InternalInputSocketState>;
  outputs?: Record<string, InternalOutputSocketState>;
};

export type NodeResolution<C, S> = {
  id: string;
  state: NodeState;
  node: InternalNode<C, S>;
};

export class Nodes<C, S> {
  nodes: CurrentNodes<C, S>;
  state: NodesState;
  connection: LiveConnection;
  position: Writable<Position>;
  readonly: Writable<boolean>;

  inputs?: Record<string, { type: string; value: Writable<unknown> }>;
  outputs?: Record<string, { type: string; value: Writable<unknown> }>;

  sockets: Sockets<C, S>;

  constructor(
    position: Writable<Position>,
    nodes: CurrentNodes<C, S>,
    state: NodesState,
    connection: LiveConnection,
    readonly: Writable<boolean>,
    inputs?: Record<string, { type: string; value: Writable<unknown> }>,
    outputs?: Record<string, { type: string; value: Writable<unknown> }>,
  ) {
    this.position = position;
    this.nodes = nodes;
    this.state = state;
    this.connection = connection;
    this.readonly = readonly;

    this.inputs = inputs;
    this.outputs = outputs;

    this.sockets = new Sockets(position, nodes.current, connection);

    this.restoreState(get(this.state.nodes));
  }

  public addNode = (key: string, options?: NodeOptions<S>): Promise<NodeResolution<C, S>> =>
    new Promise((resolve) => {
      const {
        position,
        title,
        color,
        className,
        style,
        store,
        deletable,
        cloneable,
        interactable,
        id: customId,
        inputs,
        outputs,
      } = options || {};

      const blueprint = get(this.nodes.registered)?.[key];
      const nodes = get(this.nodes.current);

      const id =
        customId ??
        (() => {
          let requestedId = Object.keys(nodes).length;
          let checking = true;

          while (checking) {
            if (requestedId.toString() in nodes) {
              requestedId += 1;
            } else {
              checking = false;
            }
          }

          return requestedId;
        })().toString();

      const x = position?.x ?? 0;
      const y = position?.y ?? 0;

      const newStore = store ?? blueprint?.store ?? {};

      const newState: NodeState = {
        type: key,
        x,
        y,
        store: newStore,
      };

      if (!blueprint) throw new Error(`Node with key ${key} does not exist`);

      // Add node to active nodes list
      this.nodes.current.update((prevNodes) => ({
        ...prevNodes,
        [id]: {
          inputs: (() => {
            const newInputs: Record<string, InternalInputSocket<any>> = {};

            if (blueprint.inputs) {
              Object.keys(blueprint.inputs ?? {}).map((inputKey) => {
                const inputBlueprint = blueprint.inputs?.[inputKey];

                if (inputBlueprint) {
                  const type = inputBlueprint.type;
                  const defaultValue = inputBlueprint?.defaultValue;
                  const connection = inputs?.[inputKey].connection;

                  newState.inputs = {
                    ...newState.inputs,
                    [inputKey]: {
                      type,
                      connection,
                    },
                  };

                  newInputs[inputKey] = {
                    ...this.sockets.createInput(type, defaultValue, { connection }),
                    color: inputBlueprint.color,
                  };
                }
              });
            }

            return Object.keys(newInputs).length > 0 ? newInputs : undefined;
          })(),
          outputs: (() => {
            const newOutputs: Record<string, InternalOutputSocket<any>> = {};

            if (blueprint.outputs) {
              Object.keys(blueprint.outputs ?? {}).map((outputKey) => {
                const outputBlueprint = blueprint.outputs?.[outputKey];
                const outputState = outputs?.[outputKey];

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

                  newOutputs[outputKey] = {
                    ...this.sockets.createOutput(type, defaultValue),
                    color: outputBlueprint.color,
                  };
                }
              });
            }
            return Object.keys(newOutputs).length > 0 ? newOutputs : undefined;
          })(),
          type: key,
          x,
          y,
          title: title ?? blueprint.title,
          component: blueprint.component,
          color: color ?? blueprint.color,
          className: className ?? blueprint.className,
          style: style ?? blueprint.style,
          deletable: deletable ?? blueprint.deletable,
          cloneable: cloneable ?? blueprint.cloneable,
          interactable: interactable ?? blueprint.interactable,
          store: newStore,
        },
      }));

      this.state.nodes.update((prevNodesState) => ({
        ...prevNodesState,
        [id]: newState,
      }));

      tick().then(() => {
        resolve({ id, state: newState, node: get(this.nodes.current)[id] });
      });
    });

  public updateNode = (id: string, options?: NodeOptions<S>): Promise<NodeResolution<C, S>> =>
    new Promise((resolve) => {
      const {
        position,
        title,
        color,
        className,
        style,
        store,
        deletable,
        cloneable,
        interactable,
      } = options || {};

      const nodes = get(this.nodes.current);
      const currentState = get(this.state.nodes);

      if (!nodes[id]) throw new Error(`Node with id ${id} does not exist`);
      if (!currentState[id]) throw new Error(`Could not find state for node with id ${id}`);

      const x = position?.x ?? currentState[id].x;
      const y = position?.y ?? currentState[id].y;

      const newStore = store ?? currentState[id].store;

      const newState: NodeState = {
        ...currentState[id],
        x,
        y,
        store: newStore,
      };

      this.nodes.current.update((prevNodes) => ({
        ...prevNodes,
        [id]: {
          ...prevNodes[id],
          x,
          y,
          title: title ?? prevNodes[id].title,
          color: color ?? prevNodes[id].color,
          className: className ?? prevNodes[id].className,
          style: style ?? prevNodes[id].style,
          deletable: deletable ?? prevNodes[id].deletable,
          cloneable: cloneable ?? prevNodes[id].cloneable,
          interactable: interactable ?? prevNodes[id].interactable,
          store: newStore,
        },
      }));

      this.state.nodes.update((prevNodesState) => ({
        ...prevNodesState,
        [id]: newState,
      }));

      tick().then(() => {
        resolve({ id, state: newState, node: get(this.nodes.current)[id] });
      });
    });

  public connectNodes = (params: { input: NodeConnection; output: NodeConnection }): void => {
    const { input, output } = params;
    const { nodeId: nodeId1, socketId: socketId1 } = input;
    const { nodeId: nodeId2, socketId: socketId2 } = output;

    if (!nodeId1 || !nodeId2 || !socketId1 || !socketId2)
      throw new Error('An input or output was not provided or is missing data');

    const nodes = get(this.nodes.current);

    const node1 = nodes[nodeId1];
    const node2 = nodes[nodeId2];

    const inputSocket = node1.inputs?.[socketId1];
    const outputSocket = node2.outputs?.[socketId2];

    if (!inputSocket || !outputSocket) throw new Error('An input or output socket was not found');

    inputSocket.connection.update(() => ({
      connectedNodeId: nodeId2,
      connectedSocketId: socketId1,
    }));
  };

  public deleteNode = (id: string): void => {
    const currentNodes = get(this.nodes.current);

    const newNodes = Object.keys(currentNodes).reduce(
      (newNodes: Record<string, InternalNode<C, S>>, key) => {
        const oldNode = currentNodes[key];
        const inputs = oldNode.inputs;

        if (inputs) {
          Object.keys(inputs).forEach((inputKey) => {
            const connection = get(inputs[inputKey].connection);

            if (connection?.connectedSocketId && connection?.connectedNodeId === id) {
              inputs[inputKey].connection.update(() => undefined);
            }
          });
        }

        if (key !== id) newNodes[key] = oldNode;

        return newNodes;
      },
      {},
    );

    this.nodes.current.update(() => newNodes);
  };

  public cloneNode = (id: string, position?: Point): Promise<NodeResolution<C, S>> =>
    new Promise((resolve) => {
      const node = get(this.nodes.current)[id];
      const state = get(this.state.nodes)[id];

      if (state) {
        this.addNode(
          node.type,
          deepmerge(
            {
              inputs: state.inputs,
              outputs: undefined,
              store: state.store,
              x: position?.x ?? state.x,
              y: position?.y ?? state.y,
              type: state.type,
            },
            {},
          ),
        ).then((node) => resolve(node));
      } else {
        throw new Error('Cannot clone node that does not exist');
      }
    });

  public clear = (): void => {
    this.nodes.current.update(() => ({}));
    this.state.nodes.update(() => ({}));
  };

  private restoreState = (state: Record<string, NodeState>): void => {
    Object.keys(state).forEach((id) =>
      this.addNode(state[id].type, {
        id,
        ...state[id],
      }),
    );

    void tick().then(() => {
      this.state.restored.set(true);
    });
  };

  public reset = (state: Record<string, NodeState>): void => {
    this.clear();
    this.state.restored.set(false);

    void tick().then(() => {
      this.restoreState(state);
    });
  };

  public updateState = (): void => {
    const nodes = get(this.nodes.current);
    const state = get(this.state.nodes);

    let newState: Record<string, NodeState> = {};

    Object.keys(nodes).forEach((id) => {
      if (state[id]) {
        newState = {
          ...newState,
          [id]: {
            ...state[id],
            x: nodes[id].x,
            y: nodes[id].y,
            inputs: {
              ...state[id].inputs,
              ...(() => {
                let inputs: Record<string, InternalInputSocketState> = {};

                Object.keys(nodes[id]?.inputs ?? {}).forEach((inputId) => {
                  const type = nodes[id].inputs?.[inputId].type ?? '';
                  const connection = nodes[id].inputs?.[inputId]?.connection;

                  inputs = {
                    ...inputs,
                    [inputId]: {
                      type,
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
                let outputs: Record<string, InternalOutputSocketState> = {};

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
      }
    });

    this.state.nodes.set(newState);
  };
}
