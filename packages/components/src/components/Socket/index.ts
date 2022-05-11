import {
  get,
  readable,
  Readable,
  Unsubscriber,
  writable,
  Writable,
} from 'svelte/store';
import { Point } from '../../types';
import { liveConnectionPoints, showLiveConnection } from '../Connection';
import { nodesRegistry } from '../Nodes';

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
}

export type ConnectionSocket = {
  type: 'input' | 'output';
  nodeId: string;
  socketId: string;
}

/**
 * @param {string}  type - All inputs and outputs with the same type will be linkable
 * @param {string=} defaultValue - A default value to initialize your socket
 * @returns {Socket}
 */
export const createInputSocket = <T>(type: string, defaultValue?: T): InputSocket<T> => {
  let valueUnsubscribe: Unsubscriber | undefined;

  const connection = writable<SocketConnection | undefined>();
  const value = readable<T>(defaultValue, (set) => {
    connection.subscribe((connections) => {
      if (connections) {
        const { connectedNodeId, connectedSocketId } = connections;
        
        if (connectedNodeId && connectedSocketId) {
          const nodes = get(nodesRegistry);
  
          if (nodes) {
            const connectedSocket = nodes[connectedNodeId].outputs?.[connectedSocketId];
    
            if (connectedSocket && connectedSocket.type === type) {
              valueUnsubscribe = connectedSocket.value.subscribe((value) => set(value));
              return;
            }
          }
        }
      }
      
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
};

/**
 * @param {string}  type - All inputs and outputs with the same type will be linkable
 * @param {string=} defaultValue - A default value to initialize your socket
 * @returns {Socket}
 */
export const createOutputSocket = <T>(type: string, defaultValue?: T): OutputSocket<T> => {
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

export const createSocketConnection = (
  connection: {
    input?: { nodeId: string, socketId: string }
    output?: { nodeId: string, socketId: string },
  },
): void => {
  const type: 'input' | 'output' = connection.input ? 'input' : 'output';
  const socketConnection = connection.input ?? connection.output;

  if (!socketConnection) return;
  
  let socket: ConnectionSocket = {
    type,
    ...socketConnection,
  };

  const { nodeId, socketId } = socket;
  const nodes = get(nodesRegistry);

  // If the socket is pending connection
  if (get(showLiveConnection)) {
    const connection = get(liveConnectionPoints);

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
    showLiveConnection.set(true);
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
        liveConnectionPoints.set({
          points: {
            p1: {
              x: event.clientX,
              y: event.clientY,
            },
            p2: coordinates,
          },
          socket,
        });
      }
    };
  
    document.addEventListener('mousemove', mousemove);
  
    showLiveConnection.subscribe((connected) => {
      if (!connected) {
        document.removeEventListener('mousemove', mousemove);
        liveConnectionPoints.set(undefined);
      }
    });
  }
};