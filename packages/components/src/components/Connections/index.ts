import { get } from 'svelte/store';
import { Point } from '../../types';
import { nodesRegistry } from '../Nodes';

export const getConnections = (): { p1: Point, p2: Point }[] => {
  const nodes = get(nodesRegistry);
  let connections: { p1: Point, p2: Point }[] = [];

  Object.keys(nodes).forEach((nodeId) => {
    const inputs = nodes[nodeId].inputs;
    if (inputs) {
      Object.keys(inputs).forEach((id) => {
        const input = inputs?.[id];
        if (input.connection) {
          const connection = get(input.connection);

          if (connection) {
            const output = nodes[connection.connectedNodeId].outputs?.[connection.connectedSocketId];

            if (output) {
              connections = [
                ...connections,
                {
                  p1: {
                    x: input.coordinates.x,
                    y: input.coordinates.y,
                  },
                  p2: {
                    x: output.coordinates.x,
                    y: output.coordinates.y,
                  },
                },
              ];
            }
          }
        }
      });
    }
  });

  return connections;
};