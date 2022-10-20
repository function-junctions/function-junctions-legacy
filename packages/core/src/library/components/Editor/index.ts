import { writable, type Writable } from 'svelte/store';
import type { Position } from '../Drag';
import { type InternalNodeBlueprint, Nodes, type NodeState } from '../Nodes';

export type EditorState = Partial<{
  nodes: Record<string, NodeState>;
  position: Position;
}>;

export type InternalEditorOptions<C, S> = {
  blueprint: Writable<Record<string, InternalNodeBlueprint<C, S>>>;
  state?: EditorState;
  readonly?: boolean;
  inputs?: Record<string, { type: string; value: Writable<unknown> }>;
  outputs?: Record<string, { type: string; value: Writable<unknown> }>;
};

export class InternalEditor<C, S = string> extends Nodes<C, S> {
  constructor(options: InternalEditorOptions<C, S>) {
    const { blueprint, state, readonly, inputs, outputs } = options;
    super(
      writable(
        state?.position ?? {
          originX: 0,
          originY: 0,
          translateX: 0,
          translateY: 0,
          scale: 1,
        },
      ),
      {
        registered: blueprint,
        current: writable({}),
      },
      {
        nodes: writable<Record<string, NodeState>>(state?.nodes ?? {}),
        restored: writable<boolean>(false),
      },
      {
        show: writable(false),
        state: writable(),
      },
      writable(readonly ?? false),
      inputs,
      outputs,
    );
  }
}
