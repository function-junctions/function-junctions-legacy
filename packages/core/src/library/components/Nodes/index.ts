import { tick } from 'svelte/internal';
import { get, type Writable } from 'svelte/store';
import type { Point } from '../..';
import type { Position } from '../Drag';
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
  color?: string;
  className?: string;
  store?: ST;
  style?: S;
  component: C;
  deletable?: boolean;
  cloneable?: boolean;
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

  public addNode = (
    key: string,
    position?: Point,
    state?: { id?: string; blueprint: NodeState },
  ): void => {
    const blueprint = get(this.nodes.registered)?.[key];
    const nodes = get(this.nodes.current);

    const id =
      state?.id ??
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
      })();

    const x = state?.blueprint.x ?? position?.x ?? 0;
    const y = state?.blueprint.y ?? position?.y ?? 0;

    const newState: NodeState = {
      type: key,
      x,
      y,
      store: state?.blueprint?.store,
    };

    if (blueprint) {
      // Add node to active nodes list
      this.nodes.current.update((prevNodes) => ({
        ...prevNodes,
        [id]: {
          inputs: (() => {
            const inputs: Record<string, InternalInputSocket<any>> = {};

            if (blueprint.inputs) {
              Object.keys(blueprint.inputs ?? {}).map((inputKey) => {
                const inputBlueprint = blueprint.inputs?.[inputKey];

                if (inputBlueprint) {
                  const type = inputBlueprint.type;
                  const defaultValue = inputBlueprint?.defaultValue;
                  const connection = state?.blueprint.inputs?.[inputKey].connection;

                  newState.inputs = {
                    ...newState.inputs,
                    [inputKey]: {
                      type,
                      connection,
                    },
                  };

                  inputs[inputKey] = {
                    ...this.sockets.createInput(type, defaultValue, { connection }),
                    color: inputBlueprint.color,
                  };
                }
              });
            }

            return Object.keys(inputs).length > 0 ? inputs : undefined;
          })(),
          outputs: (() => {
            const outputs: Record<string, InternalOutputSocket<any>> = {};

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

                  outputs[outputKey] = {
                    ...this.sockets.createOutput(type, defaultValue),
                    color: outputBlueprint.color,
                  };
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
          className: blueprint.className,
          style: blueprint.style,
          deletable: blueprint.deletable,
          cloneable: blueprint.cloneable,
          store: blueprint.store,
        },
      }));

      this.state.nodes.update((prevNodesState) => ({
        ...prevNodesState,
        [id]: newState,
      }));
    }
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

  public cloneNode = (id: string, position?: Point): void => {
    const node = get(this.nodes.current)[id];
    const state = get(this.state.nodes)[id];

    if (state) {
      this.addNode(node.type, position, {
        blueprint: JSON.parse(
          JSON.stringify({
            inputs: state.inputs,
            outputs: undefined,
            store: state.store,
            x: position?.x ?? state.x,
            y: position?.y ?? state.y,
            type: state.type,
          }),
        ),
      });
    } else {
      throw new Error('Cannot clone node that does not exist');
    }
  };

  public clear = (): void => {
    this.nodes.current.update(() => ({}));
    this.state.nodes.update(() => ({}));
  };

  private restoreState = (state: Record<string, NodeState>): void => {
    Object.keys(state).forEach((id) =>
      this.addNode(state[id].type, { x: 0, y: 0 }, { id, blueprint: state[id] }),
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

    // this.state.nodes.set(newState);
  };
}
