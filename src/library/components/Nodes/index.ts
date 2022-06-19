import { SvelteComponentDev, tick } from 'svelte/internal';
import { get, type Writable } from 'svelte/store';
import type { Point } from '../../types';
import type { Position } from '../Drag';
import { inputNode, outputNode } from '../Node';
import {
  type InputSocket,
  type InputSockets,
  type InputSocketState,
  type LiveConnection,
  type OutputSocket,
  type OutputSockets,
  type OutputSocketState,
  type SocketBlueprint,
  Sockets,
} from '../Sockets';

export type NodeBlueprint<
  I extends Record<string, SocketBlueprint> = Record<string, SocketBlueprint>,
  O extends Record<string, SocketBlueprint> = Record<string, SocketBlueprint>
> = {
  inputs?: I;
  outputs?: O;
  color?: string;
  className?: string;
  style?: string;
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
  className?: string;
  style?: string;
};

export type NodeState = Point & {
  type: string;
  inputs?: Record<string, InputSocketState>;
  outputs?: Record<string, OutputSocketState>;
  store?: Record<string, unknown>;
}

export type CurrentNodes = {
  registered: Writable<Record<string, NodeBlueprint>>;
  current: Writable<Record<string, Node>>;
  selected: Writable<string[]>;
}

export type NodesState = {
  nodes: Writable<Record<string, NodeState>>;
  restored: Writable<boolean>;
}

export class Nodes {
  nodes: CurrentNodes;
  state: NodesState;
  connection: LiveConnection;
  position: Writable<Position>;
  readonly: Writable<boolean>;

  inputs?: Record<string, Record<string, Writable<unknown>>>;
  outputs?: Record<string, Record<string, Writable<unknown>>>;

  sockets: Sockets;
  
  constructor (
    position: Writable<Position>,
    nodes: CurrentNodes,
    state: NodesState,
    connection: LiveConnection,
    readonly: Writable<boolean>,
    inputs?: Record<string, Record<string, Writable<unknown>>>,
    outputs?: Record<string, Record<string, Writable<unknown>>>,
  ) {
    this.position = position;
    this.nodes = nodes;
    this.state = state;
    this.connection = connection;
    this.readonly = readonly;

    this.inputs = inputs;
    this.outputs = outputs;

    this.sockets = new Sockets(position, nodes.current, connection);

    this.nodes.registered.update((prevNodes) => {
      let newNodes = prevNodes;

      if (this.inputs) newNodes = {
        ...newNodes,
        Input: inputNode,
      };

      if (this.outputs) newNodes = {
        ...newNodes,
        Output: outputNode,
      };

      return newNodes;
    });

    this.restoreState(get(this.state.nodes));
  }

  public addNode = (
    key: string,
    position?: Point,
    state?: { id?: string; blueprint: NodeState; },
  ): void => {
    const blueprint = get(this.nodes.registered)?.[key];
    const nodes = get(this.nodes.current);
  
    const id = state?.id ?? (() => {
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
  
    const x = position?.x ?? state?.blueprint.x ?? 0;
    const y = position?.y ?? state?.blueprint.y ?? 0;
  
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
            const inputs: InputSockets<Record<string, any>> = {};
        
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
                    ...this.sockets.createInput(
                      type,
                      defaultValue,
                      { connection },
                    ),
                    color: inputBlueprint.color,
                  };
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

    this.nodes.current.update(() => Object.keys(currentNodes).reduce((newNodes: Record<string, Node>, key) => {
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
    }, {}));
  };

  public cloneNode = (id: string, position?: Point): void => {
    const node = get(this.nodes.current)[id];
    const state = get(this.state.nodes)[id];
  
    if (state) {
      this.addNode(node.type, position, {
        blueprint: {
          inputs: state.inputs,
          outputs: undefined,
          store: state.store,
          x: state.x,
          y: state.y,
          type: state.type,
        },
      });
    } else {
      throw new Error('Cannot clone node that does not exist');
    }
  };

  private restoreState = (state: Record<string, NodeState>): void => {
    Object.keys(state).forEach(
      (id) => this.addNode(state[id].type, { x: 0, y: 0 }, { id, blueprint: state[id] }),
    );

    void tick().then(() => {
      this.state.restored.set(true);
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
                let inputs: Record<string, InputSocketState> = {};
    
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
      }
    });
  
    this.state.nodes.set(newState);
  };
}