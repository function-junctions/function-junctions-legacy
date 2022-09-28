import { tick } from 'svelte';
import {
  get,
  readable,
  type Readable,
  type Unsubscriber,
  type Writable,
  writable,
} from 'svelte/store';
import type { Point } from '../../types';
import type { Position } from '../Drag';
import type { Node } from '../Nodes';

export type SocketConnection = {
  connectedNodeId: string;
  connectedSocketId: string;
};

export type SocketBlueprint<T = any> = {
  type: string;
  defaultValue?: T;
  color?: string;
};

export type InputSocket<T> = {
  type: string;
  value: Readable<T>;
  color?: string;
  connection: Writable<SocketConnection | undefined>;
  coordinates: Point;
  disabled?: boolean;
};

export type OutputSocket<T> = {
  type: string;
  value: Writable<T>;
  color?: string;
  coordinates: Point;
  trigger?: boolean;
  disabled?: boolean;
};

export type InputSocketState = {
  type: string;
  connection?: SocketConnection;
};

export type OutputSocketState = {
  type: string;
  value: unknown;
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

export class Sockets {
  nodes: Writable<Record<string, Node>>;
  editorPosition: Writable<Position>;
  liveConnection: LiveConnection;

  constructor(
    editorPosition: Writable<Position>,
    nodes: Writable<Record<string, Node>>,
    liveConnection: LiveConnection
  ) {
    this.nodes = nodes;
    this.editorPosition = editorPosition;
    this.liveConnection = liveConnection;
  }

  private update = (nodeId: string, socketId: string) => {
    this.nodes.update((prevNodes) => ({
      ...prevNodes,
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
    }));
  };

  public createInput = <T>(
    type: string,
    defaultValue?: T,
    state?: {
      connection?: SocketConnection;
    }
  ): InputSocket<T> => {
    let valueUnsubscribe: Unsubscriber | undefined;
    let prevConnectedNodeId: string;
    let prevConnectedSocketId: string;

    const connection = writable<SocketConnection | undefined>(state?.connection);

    const value = readable<T>(defaultValue, (set) => {
      connection.subscribe((connections) => {
        const nodes = get(this.nodes);

        void tick().then(() => {
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

          if (valueUnsubscribe) {
            // https://github.com/sveltejs/svelte/issues/4765
            // Reactive stores are scary
            try {
              valueUnsubscribe();
            } catch (error) {
              return;
            }
          }
          if (typeof defaultValue !== 'undefined') set(defaultValue);
          if (prevConnectedNodeId && prevConnectedSocketId)
            this.update(prevConnectedNodeId, prevConnectedSocketId);
        });
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

  public createOutput = <T>(type: string, defaultValue?: T): OutputSocket<T> => {
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

  public connect(
    type: 'input' | 'output',
    newConnection: { nodeId: string; socketId: string; socketType: string }
  ): void {
    let socket: ConnectionSocket = {
      type,
      ...newConnection,
    };

    const { nodeId, socketId } = socket;
    const nodes = get(this.nodes);

    // If the socket is pending connection
    if (get(this.liveConnection.show)) {
      const connection = get(this.liveConnection.state);

      // Return if the socket is attempting to connect to the same node
      if (connection?.socket?.nodeId === nodeId) return;

      // Return if socket is not of the same type
      if (connection?.socket?.nodeId && connection?.socket?.socketId) {
        const { nodeId: connectedNodeId, socketId: connectedSocketId } = connection.socket;
        const oldConnectionType =
          nodes[connectedNodeId][socket.type === 'input' ? 'outputs' : 'inputs']?.[
            connectedSocketId
          ].type;
        if (oldConnectionType !== newConnection.socketType) {
          return;
        }
      }

      if (type === 'input' && connection?.socket && connection?.socket.type === 'output') {
        const { nodeId: connectedNodeId, socketId: connectedSocketId } = connection.socket;

        const previousSocketConnection = nodes[nodeId]['inputs']?.[socketId].connection;

        if (previousSocketConnection) {
          if (get(previousSocketConnection)) return;

          nodes[nodeId]['inputs']?.[socketId].connection.set({
            connectedNodeId,
            connectedSocketId,
          });
        }
      } else if (type === 'output' && connection?.socket && connection?.socket.type === 'input') {
        const { nodeId: connectedNodeId, socketId: connectedSocketId } = connection.socket;
        nodes[connectedNodeId]['inputs']?.[connectedSocketId].connection.set({
          connectedNodeId: nodeId,
          connectedSocketId: socketId,
        });
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
