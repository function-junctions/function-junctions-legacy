import { tick } from 'svelte';
import { get, writable } from 'svelte/store';
import { LiveConnection, Sockets } from '.';
import { Position } from '../Drag';
import { InternalNode } from '../Nodes';

const mockNodes: Record<string, InternalNode<unknown, string>> = {
  Test: {
    x: 0,
    y: 0,
    type: 'Test',
    inputs: {},
    outputs: {},
    store: {},
    component: undefined,
  },
};

const mockEditorPosition: Position = {
  originX: 0,
  originY: 0,
  translateX: 0,
  translateY: 0,
  scale: 0,
};

const mockLiveConnection: LiveConnection = {
  show: writable(false),
  state: writable(undefined),
};

const defaultValue = 10;

describe('Core: Tests for the "Sockets" component', () => {
  it('should initialize sockets', () => {
    const nodes = writable(mockNodes);
    const editorPosition = writable(mockEditorPosition);

    const sockets = new Sockets(editorPosition, nodes, mockLiveConnection);

    expect(sockets).toBeDefined();
  });

  it('should initialize input socket', async () => {
    const nodes = writable(mockNodes);
    const editorPosition = writable(mockEditorPosition);

    const sockets = new Sockets(editorPosition, nodes, mockLiveConnection);

    nodes.update((prevNodes) => {
      prevNodes['Test'].inputs = {
        Input: sockets.createInput('Input', defaultValue),
      };

      return prevNodes;
    });

    await tick();

    const value = get(nodes)['Test'].inputs?.['Input'].value;

    expect(value).toBeDefined();

    if (value) expect(get(value)).toEqual(defaultValue);
  });

  it('should initialize output socket', async () => {
    const nodes = writable(mockNodes);
    const editorPosition = writable(mockEditorPosition);

    const sockets = new Sockets(editorPosition, nodes, mockLiveConnection);

    nodes.update((prevNodes) => {
      prevNodes['Test'].outputs = {
        Output: sockets.createOutput('Output', defaultValue),
      };

      return prevNodes;
    });

    await tick();

    const value = get(nodes)['Test'].outputs?.['Output'].value;

    expect(value).toBeDefined();

    if (value) expect(get(value)).toEqual(defaultValue);
  });

  it('should update input socket', async () => {
    const nodes = writable(mockNodes);
    const editorPosition = writable(mockEditorPosition);

    const sockets = new Sockets(editorPosition, nodes, mockLiveConnection);

    nodes.update((prevNodes) => {
      prevNodes['Test'].outputs = {
        Output: sockets.createOutput('Output', defaultValue),
      };

      return prevNodes;
    });

    await tick();

    const output = get(nodes)['Test'].outputs?.['Output'];
    const value = output?.value;

    expect(value).toBeDefined();

    if (value) {
      const realValue = get(value);

      expect(realValue).toEqual(defaultValue);
      sockets['update']('Test', 'Output');

      await tick();
      const newNodes = get(nodes);

      expect(newNodes['Test'].outputs?.['Output'].trigger).toEqual(true);
    }
  });
});
