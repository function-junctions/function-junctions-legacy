import {
  get,
  readable,
  Readable,
  Unsubscriber,
  writable,
  Writable,
} from 'svelte/store';
import { Point } from '../../types';
import { liveConnectionPoints, showLiveConnection } from '../Connection/store';
import { nodesCoordinates, activeNodes } from '../Nodes/store';

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

/**
 * @param {string}  type - All inputs and outputs with the same type will be linkable
 * @param {string=} defaultValue - A default value to initialize your socket
 * @returns {Socket}
 */
export const createInputSocket = <T>(
  type: string,
  defaultValue?: T,
  state?: {
    connection?: SocketConnection;
    value: T;
  },
): InputSocket<T> => {
  let valueUnsubscribe: Unsubscriber | undefined;

  let prevConnectedNodeId: string, prevConnectedSocketId: string;

  const updateActiveNodes = (connectedNodeId: string, connectedSocketId: string) => {
    // Not sure why the type signature here is incorrect
    // @ts-expect-error
    activeNodes.update((prevActiveNodes) => ({
      ...prevActiveNodes,
      [connectedNodeId]: {
        ...prevActiveNodes[connectedNodeId],
        outputs: {
          ...prevActiveNodes[connectedNodeId]?.outputs,
          [connectedSocketId]: {
            ...prevActiveNodes[connectedNodeId].outputs?.[connectedSocketId],
            trigger: !prevActiveNodes[connectedNodeId].outputs?.[connectedSocketId].trigger,
          },
        },
      },
    }));
  };

  const connection = writable<SocketConnection | undefined>(state?.connection);
  const value = readable<T>(state?.value ?? defaultValue, (set) => {
    connection.subscribe((connections) => {
      if (connections) {
        const { connectedNodeId, connectedSocketId } = connections;
        
        if (connectedNodeId && connectedSocketId) {
          const nodes = get(activeNodes);

          prevConnectedNodeId = connectedNodeId;
          prevConnectedSocketId = connectedSocketId;
  
          if (nodes) {
            const connectedSocket = nodes[connectedNodeId].outputs?.[connectedSocketId];
    
            if (connectedSocket && connectedSocket.type === type) {
              valueUnsubscribe = connectedSocket.value.subscribe((value) => {
                updateActiveNodes(connectedNodeId, connectedSocketId);

                set(value);
              });
              
              return;
            }
          }
        }
      }
      
      if (prevConnectedNodeId && prevConnectedSocketId) updateActiveNodes(prevConnectedNodeId, prevConnectedSocketId);
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
  const nodes = get(activeNodes);

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
        const offsetX = (get(nodesCoordinates).originX * get(nodesCoordinates).scale) - get(nodesCoordinates).originX;
        const offsetY = (get(nodesCoordinates).originY * get(nodesCoordinates).scale) - get(nodesCoordinates).originY;

        const mouseX = ((event.clientX - get(nodesCoordinates).translateX) + offsetX) / (get(nodesCoordinates).scale);
        const mouseY = ((event.clientY - get(nodesCoordinates).translateY) + offsetY) / (get(nodesCoordinates).scale);


        liveConnectionPoints.set({
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
  
    showLiveConnection.subscribe((connected) => {
      if (!connected) {
        document.removeEventListener('mousemove', mousemove);
        liveConnectionPoints.set(undefined);
      }
    });
  }
};