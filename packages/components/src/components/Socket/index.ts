import {
  get,
  readable,
  Readable,
  writable,
  Writable,
} from 'svelte/store';
import { nodesRegistry } from '../Nodes';

export type SocketConnection = {
  connectedNodeId: string;
  connectedSocketId: string;
}

export type InputSocket<T> = {
  type: string;
  value: Readable<T>;
  connection: Writable<SocketConnection | undefined>;
};

export type OutputSocket<T> = {
  type: string;
  value: Writable<T>;
}

/**
 * @param {string}  type - All inputs and outputs with the same type will be linkable
 * @param {string=} defaultValue - A default value to initialize your socket
 * @returns {Socket}
 */
export const createInputSocket = <T>(type: string, defaultValue?: T): InputSocket<T> => {
  const connection = writable<SocketConnection>();
  const value = readable<T>(defaultValue, (set) => {
    connection.subscribe((connections) => {
      if (connections) {
        const { connectedNodeId, connectedSocketId } = connections;
        
        if (connectedNodeId && connectedSocketId) {
          const nodes = get(nodesRegistry);
  
          if (nodes) {
            const connectedSocket = nodes[connectedNodeId].outputs?.[connectedSocketId];
    
            if (connectedSocket && connectedSocket.type === type) {
              connectedSocket.value.subscribe((value) => {
                console.log(value);
                set(value);
              });
              return;
            }
          }
        }
      }
      
      if (defaultValue) set(defaultValue);
    });
  });

  return {
    type,
    value,
    connection,
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
  };
};