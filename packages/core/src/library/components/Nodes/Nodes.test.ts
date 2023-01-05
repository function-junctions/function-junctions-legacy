import { tick } from 'svelte';
import { get, writable } from 'svelte/store';
import { InternalNodeBlueprint } from '.';
import { EditorState, InternalEditor } from '../Editor';
import { SocketBlueprint } from '../Sockets';

const mockNode: InternalNodeBlueprint<
  unknown,
  unknown,
  {
    Input: SocketBlueprint<number>;
  },
  {
    Output: SocketBlueprint<number>;
  }
> = {
  inputs: {
    Input: {
      type: 'number',
    },
  },
  outputs: {
    Output: {
      type: 'number',
    },
  },
  component: undefined,
};

const mockBlueprint = {
  Node: mockNode,
};

const mockState: EditorState = {
  position: { originX: 0, originY: 0, translateX: 0, translateY: 0, scale: 1 },
  nodes: {
    '0': {
      type: 'Node',
      x: 0,
      y: 0,
      store: {},
      inputs: { Input: { type: 'number' } },
      outputs: { Output: { type: 'number' } },
    },
  },
};

describe('Core: Tests for the "Nodes" component', () => {
  it('should add a node to the graph', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    editor.addNode('Node', { x: 0, y: 0 });

    const nodes = get(editor.nodes.current);

    expect(Object.keys(nodes).length).toBe(1);
  });

  it('should add 100 nodes to the graph', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    Array.from(Array(100).keys()).forEach(() => {
      editor.addNode('Node', { x: 0, y: 0 });
    });

    expect(Object.keys(get(editor.nodes.current)).length).toBe(100);
  });

  it('should add a node to the graph then clone it', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    editor.addNode('Node', { x: 0, y: 0 });
    editor.cloneNode('0');

    const nodes = get(editor.nodes.current);

    expect(Object.keys(nodes).length).toBe(2);
  });

  it('should add a node to the graph then delete it', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    editor.addNode('Node', { x: 0, y: 0 });

    expect(Object.keys(get(editor.nodes.current)).length).toBe(1);

    editor.deleteNode('0');

    expect(Object.keys(get(editor.nodes.current)).length).toBe(0);
  });

  it('should add 3 nodes to the graph then clear it', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    Array.from(Array(3).keys()).forEach(() => {
      editor.addNode('Node', { x: 0, y: 0 });
    });

    expect(Object.keys(get(editor.nodes.current)).length).toBe(3);

    editor.clear();

    expect(Object.keys(get(editor.nodes.current)).length).toBe(0);
  });

  it('should add a node and update its metadata', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    const newProperties = {
      x: 100,
      y: 100,
      title: 'Test',
      deletable: false,
      cloneable: false,
      interactable: false,
    };

    editor.addNode('Node', { x: 0, y: 0 });

    const updatedNode = await editor.updateNode('0', newProperties);

    expect(updatedNode.node).toEqual(expect.objectContaining(newProperties));
  });

  it('should add a node and update its inputs/outputs', async () => {
    const keyWord = 'test';

    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    editor.addNode('Node', { x: 0, y: 0 });

    const newProperties = {
      inputs: {
        Input: {
          type: keyWord,
        },
      },
      outputs: {
        Output: {
          type: keyWord,
        },
      },
    };

    await editor.updateNode('0', newProperties);

    // Pulling from state to ensure the update persisted
    const updatedNodeFromState = get(editor.nodes.current)['0'];

    expect(updatedNodeFromState.inputs?.['Input'].type).toEqual(keyWord);
    expect(updatedNodeFromState.outputs?.['Output'].type).toEqual(keyWord);
  });

  it('should connect 2 nodes', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    editor.addNode('Node', { x: 0, y: 0 });
    editor.addNode('Node', { x: 0, y: 0 });

    editor.connectNodes({
      output: {
        nodeId: '0',
        socketId: 'Output',
      },
      input: {
        nodeId: '1',
        socketId: 'Input',
      },
    });

    const nodes = get(editor.nodes.current);

    const connectionStore = nodes['1'].inputs?.['Input'].connection;

    expect(connectionStore).toBeDefined();

    if (connectionStore) {
      const connection = get(connectionStore);

      expect(connection?.connectedNodeId).toEqual('0');
      expect(connection?.connectedSocketId).toEqual('Output');
    }
  });

  it('should initialize the graph with state', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
      state: mockState,
    });

    const state = get(editor.state.nodes);

    expect(state).toEqual(mockState.nodes);
  });

  it('should add a node then reset the graph with state', async () => {
    const editor = new InternalEditor({
      blueprint: writable(mockBlueprint),
    });

    editor.addNode('Node', { x: 0, y: 0 });
    editor.addNode('Node', { x: 0, y: 0 });

    expect(Object.keys(get(editor.nodes.current)).length).toBe(2);

    expect(mockState.nodes).toBeDefined();

    if (mockState.nodes) {
      editor.reset(mockState.nodes);

      await tick();
      const state = get(editor.state.nodes);

      expect(state).toEqual(mockState.nodes);
    }
  });
});
