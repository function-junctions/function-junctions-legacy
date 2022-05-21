import {
  get,
  readable,
  Readable,
  Unsubscriber,
  writable,
  Writable,
} from 'svelte/store';
import { Point } from '../../types';
import { Position } from '../Drag';
import { Node } from '../Nodes';

export type SocketConnection = {
  connectedNodeId: string;
  connectedSocketId: string;
}

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
};

export type OutputSocket<T> = {
  type: string;
  value: Writable<T>;
  color?: string;
  coordinates: Point;
  trigger?: boolean;
};

export type InputSocketState = {
  type: string;
  value: unknown;
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
}

export type InputSockets<T extends Record<string, InputSocket<any>>> = T;
export type OutputSockets<T extends Record<string, OutputSocket<any>>> = T;

export type LiveConnection = {
  show: Writable<boolean>;
  state: Writable<{
    points: { p1: Point, p2: Point },
    socket?: ConnectionSocket;
  } | undefined>;
}

export class Sockets {
  nodes: Writable<Record<string, Node>>;
  editorPosition: Writable<Position>;
  liveConnection: LiveConnection;

  constructor (editorPosition: Writable<Position>, nodes: Writable<Record<string, Node>>, liveConnection: LiveConnection) {
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
  }

  public createInput = <T>(
    type: string,
    defaultValue?: T,
    state?: {
      connection?: SocketConnection;
      value: T;
    },
  ): InputSocket<T> => {
    let valueUnsubscribe: Unsubscriber | undefined;
    let prevConnectedNodeId: string;
    let prevConnectedSocketId: string;

    const connection = writable<SocketConnection | undefined>(state?.connection);

    const value = readable<T>(state?.value ?? defaultValue, (set) => {
      connection.subscribe((connections) => {
        if (connections) {
          const { connectedNodeId, connectedSocketId } = connections;
          
          if (connectedNodeId && connectedSocketId) {
            prevConnectedNodeId = connectedNodeId;
            prevConnectedSocketId = connectedSocketId;
            
            const connectedSocket = get(this.nodes)[connectedNodeId]?.outputs?.[connectedSocketId];
    
            if (connectedSocket && connectedSocket.type === type) {
              valueUnsubscribe = connectedSocket.value.subscribe((value) => {
                this.update(connectedNodeId, connectedSocketId);

                set(value);
              });
              
              return;
            }
          }
        }
        
        if (prevConnectedNodeId && prevConnectedSocketId) this.update(prevConnectedNodeId, prevConnectedSocketId);
        if (valueUnsubscribe) valueUnsubscribe();
        if (typeof defaultValue !== 'undefined') set(defaultValue);
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
  }

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
  }

  public connect(type: 'input' | 'output', connection: { nodeId: string, socketId: string }): void {
    let socket: ConnectionSocket = {
      type,
      ...connection,
    };

    const { nodeId, socketId } = socket;
    const nodes = get(this.nodes);

    // If the socket is pending connection
    if (get(this.liveConnection.show)) {
      const connection = get(this.liveConnection.state);

      // Return if the socket is attempting to connect to the same node
      if (connection?.socket?.nodeId === nodeId) return;

      if (
        type === 'input'
      && connection?.socket
      && connection?.socket.type === 'output'
      ) {
        const { nodeId: connectedNodeId, socketId: connectedSocketId } = connection.socket;

        const previousSocketConnection = nodes[nodeId]['inputs']?.[socketId].connection;

        if (previousSocketConnection) {
          if (get(previousSocketConnection)) return;

          nodes[nodeId]['inputs']?.[socketId].connection.set({
            connectedNodeId,
            connectedSocketId,
          });
        }
      } else if (
        type === 'output'
      && connection?.socket
      && connection?.socket.type === 'input'
      ) {
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
            coordinates = nodes[input.connectedNodeId]['outputs']?.[input.connectedSocketId].coordinates;
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
          const offsetX = (position.originX * position.scale) - position.originX;
          const offsetY = (position.originY * position.scale) - position.originY;

          const mouseX = ((event.clientX - position.translateX) + offsetX) / (position.scale);
          const mouseY = ((event.clientY - position.translateY) + offsetY) / (position.scale);


          this.liveConnection.state.set({
            points: socket.type === 'output' ? {
              p1: {
                x: mouseX,
                y: mouseY,
              },
              p2: coordinates,
            } : {
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