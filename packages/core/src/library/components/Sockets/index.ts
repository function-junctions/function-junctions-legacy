import { conditionalExpression } from '@babel/types';
import deepmerge from 'deepmerge';
import {
  get,
  readable,
  type Readable,
  type Unsubscriber,
  type Writable,
  writable,
} from 'svelte/store';
import type { Point } from '../..';
import type { Position } from '../Drag';
import type { InternalNode, NodesState, NodeState } from '../Nodes';

export type SocketConnection = {
  connectedNodeId: string;
  connectedSocketId: string;
};

export type SocketBlueprint<T = any> = {
  type: string;
  defaultValue?: T;
  color?: string;
};

export type InternalInputSocket<T> = {
  type: string;
  value: Readable<T>;
  color?: string;
  connection: Writable<SocketConnection | undefined>;
  coordinates: Readonly<Point>;
  disabled?: boolean;
};

export type InternalOutputSocket<T> = {
  type: string;
  value: Writable<T>;
  color?: string;
  coordinates: Readonly<Point>;
  trigger?: Readonly<boolean>;
  disabled?: boolean;
};

export type InternalInputSocketState = {
  type: string;
  connection?: SocketConnection;
};

export type InternalOutputSocketState = {
  type: string;
  value?: unknown;
};

export type ConnectionSocket = {
  type: 'input' | 'output';
  nodeId: string;
  socketId: string;
};

export type LiveConnection = {
  show: Writable<boolean>;
  state: Writable<
    | {
        points: { p1: Point; p2: Point };
        socket?: ConnectionSocket;
      }
    | undefined
  >;
};

export class Sockets<C, S> {
  nodes: Writable<Record<string, InternalNode<C, S>>>;
  state: Writable<Record<string, NodeState>>;
  editorPosition: Writable<Position>;
  liveConnection: LiveConnection;

  constructor(
    editorPosition: Writable<Position>,
    nodes: Writable<Record<string, InternalNode<C, S>>>,
    state: Writable<Record<string, NodeState>>,
    liveConnection: LiveConnection,
  ) {
    this.nodes = nodes;
    this.state = state;
    this.editorPosition = editorPosition;
    this.liveConnection = liveConnection;
  }

  private update = (nodeId: string, socketId: string) => {
    this.nodes.update((prevNodes) => {
      const nodes = {
        ...prevNodes,
        ...(() => {
          if (prevNodes[nodeId]) {
            return {
              [nodeId]: {
                ...prevNodes[nodeId],
                outputs: {
                  ...prevNodes[nodeId]?.outputs,
                  [socketId]: {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    ...prevNodes[nodeId]?.outputs![socketId],
                    trigger: !prevNodes[nodeId]?.outputs?.[socketId].trigger,
                  },
                },
              },
            };
          }

          return;
        })(),
      };

      return nodes;
    });
  };

  public createInput = <T>(
    type: string,
    defaultValue?: T,
    state?: {
      connection?: SocketConnection;
    },
  ): InternalInputSocket<T> => {
    let valueUnsubscribe: Unsubscriber | undefined;
    let prevConnectedNodeId: string;
    let prevConnectedSocketId: string;

    const connection = writable<SocketConnection | undefined>(state?.connection);

    const value = readable<T>(defaultValue, (set) => {
      connection.subscribe((connections) => {
        const nodes = get(this.nodes);

        // If the subscriber is active disconnect it
        if (valueUnsubscribe) {
          // https://github.com/sveltejs/svelte/issues/4765
          // Reactive stores are scary
          try {
            valueUnsubscribe();
          } catch (error) {
            return;
          }
        }

        if (connections) {
          const { connectedNodeId, connectedSocketId } = connections;

          if (connectedNodeId && connectedSocketId) {
            prevConnectedNodeId = connectedNodeId;
            prevConnectedSocketId = connectedSocketId;

            const connectedSocket = nodes[connectedNodeId]?.outputs?.[connectedSocketId];

            if (connectedSocket) {
              valueUnsubscribe = connectedSocket.value.subscribe((value) => {
                this.update(connectedNodeId, connectedSocketId);

                set(value as T);
              });

              return;
            }
          }
        }

        if (typeof defaultValue !== 'undefined') set(defaultValue);
        if (prevConnectedNodeId && prevConnectedSocketId)
          this.update(prevConnectedNodeId, prevConnectedSocketId);
      });
    });

    return {
      type,
      value,
      connection,
      coordinates: {
        x: 0,
        y: 0,
      },
    };
  };

  public createOutput = <T>(type: string, defaultValue?: T): InternalOutputSocket<T> => {
    const value = writable<T>(defaultValue);

    return {
      type,
      value,
      coordinates: {
        x: 0,
        y: 0,
      },
    };
  };

  private isRecurssive = (
    outputConnection: Omit<ConnectionSocket, 'type'>,
    inputConnection: Omit<ConnectionSocket, 'type'>,
  ) => {
    const { nodeId: outputNodeId, socketId: outputSocketId } = outputConnection;
    const { nodeId: inputNodeId, socketId: inputSocketId } = inputConnection;

    const tree: Record<string, NodeState & { visited?: boolean }> = deepmerge(get(this.state), {
      [inputNodeId]: {
        inputs: {
          [inputSocketId]: {
            connection: {
              connectedNodeId: outputNodeId,
              connectedSocketId: outputSocketId,
            },
          },
        },
      },
    });

    const results: boolean[] = [];

    const traverse = (nodeId: string): boolean => {
      const { inputs } = tree[nodeId];

      if (tree[nodeId].visited) return false;

      const mappedInputs = Object.keys(inputs ?? {})
        .map((key) => inputs?.[key])
        .filter((input) => !!input)
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t?.connection?.connectedNodeId === value?.connection?.connectedNodeId &&
                t?.connection?.connectedSocketId === value?.connection?.connectedSocketId,
            ),
        );

      tree[nodeId].visited = true;

      if (mappedInputs.every((connection) => typeof connection !== 'undefined')) {
        mappedInputs.forEach((input) => {
          const newConnection = input?.connection;

          if (newConnection) {
            const { connectedNodeId: newNodeId } = newConnection;
            results.push(traverse(newNodeId));
          }
        });
      }

      return results.every((value) => value === true);
    };

    return !traverse(inputConnection.nodeId);
  };

  public connect(
    type: 'input' | 'output',
    newConnection: { nodeId: string; socketId: string; socketType: string },
  ): void {
    let socket: ConnectionSocket = {
      type,
      ...newConnection,
    };

    const { nodeId, socketId } = socket;
    const nodes = get(this.nodes);

    const isPendingConnection = get(this.liveConnection.show);
    const pendingConnection = get(this.liveConnection.state);

    // If the socket is pending connection
    if (isPendingConnection && pendingConnection) {
      const { socket: pendingConnectionSocket } = pendingConnection;

      // Return if the socket is attempting to connect to the same node
      if (!pendingConnectionSocket || pendingConnectionSocket.nodeId === nodeId) return;

      // Return if socket is not of the same type
      if (pendingConnectionSocket.nodeId && pendingConnectionSocket.socketId) {
        const { nodeId: connectedNodeId, socketId: connectedSocketId } = pendingConnectionSocket;
        const oldConnectionType =
          nodes[connectedNodeId][socket.type === 'input' ? 'outputs' : 'inputs']?.[
            connectedSocketId
          ].type;
        if (oldConnectionType !== newConnection.socketType) {
          return;
        }
      }

      if (
        type === 'input' &&
        pendingConnectionSocket &&
        pendingConnectionSocket.type === 'output'
      ) {
        const { nodeId: connectedNodeId, socketId: connectedSocketId } = pendingConnectionSocket;

        const previousSocketConnection = nodes[nodeId]['inputs']?.[socketId].connection;

        if (previousSocketConnection) {
          if (get(previousSocketConnection)) return;

          const stable = !this.isRecurssive(
            { nodeId: connectedNodeId, socketId: connectedSocketId },
            { nodeId, socketId },
          );

          if (stable) {
            nodes[nodeId]['inputs']?.[socketId].connection.set({
              connectedNodeId,
              connectedSocketId,
            });
          }
        }
      } else if (
        type === 'output' &&
        pendingConnectionSocket &&
        pendingConnectionSocket.type === 'input'
      ) {
        const { nodeId: connectedNodeId, socketId: connectedSocketId } = pendingConnectionSocket;

        const stable = !this.isRecurssive(
          { nodeId: connectedNodeId, socketId: connectedSocketId },
          { nodeId, socketId },
        );

        if (stable) {
          nodes[connectedNodeId]['inputs']?.[connectedSocketId].connection.set({
            connectedNodeId: nodeId,
            connectedSocketId: socketId,
          });
        }
      }

      return;
    } else {
      this.liveConnection.show.set(true);
      let coordinates: Point | undefined;

      if (type === 'input') {
        const inputConnection = nodes[nodeId]['inputs']?.[socketId].connection;
        if (inputConnection) {
          const input = get(inputConnection);

          if (input?.connectedNodeId && input.connectedSocketId) {
            coordinates =
              nodes[input.connectedNodeId]['outputs']?.[input.connectedSocketId].coordinates;
            nodes[nodeId]['inputs']?.[socketId].connection.set(undefined);
            socket = {
              type: 'output',
              nodeId: input.connectedNodeId,
              socketId: input.connectedSocketId,
            };
          } else {
            coordinates = nodes[nodeId]['inputs']?.[socketId].coordinates;
            socket = {
              type: 'input',
              nodeId: nodeId,
              socketId: socketId,
            };
          }
        }
      } else if (type === 'output') {
        coordinates = nodes[nodeId]['outputs']?.[socketId].coordinates;
      }

      const mousemove = (event: MouseEvent) => {
        if (coordinates) {
          const position = get(this.editorPosition);
          const offsetX = position.originX * position.scale - position.originX;
          const offsetY = position.originY * position.scale - position.originY;

          const mouseX = (event.pageX - position.translateX + offsetX) / position.scale;
          const mouseY = (event.pageY - position.translateY + offsetY) / position.scale;

          this.liveConnection.state.set({
            points:
              socket.type === 'output'
                ? {
                    p1: {
                      x: mouseX,
                      y: mouseY,
                    },
                    p2: coordinates,
                  }
                : {
                    p1: coordinates,
                    p2: {
                      x: mouseX,
                      y: mouseY,
                    },
                  },
            socket,
          });
        }
      };

      document.addEventListener('mousemove', mousemove);

      this.liveConnection.show.subscribe((connected) => {
        if (!connected) {
          document.removeEventListener('mousemove', mousemove);
          this.liveConnection.state.set(undefined);
        }
      });
    }
  }
}
