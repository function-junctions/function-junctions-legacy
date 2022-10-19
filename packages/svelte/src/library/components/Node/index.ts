import type { SvelteComponentDev } from 'svelte/internal';
import type {
  InternalNodeBlueprint,
  InternalNode,
  SocketBlueprint,
} from '@function-junctions/core';

export type NodeBlueprint<
  I = Record<string, SocketBlueprint>,
  O = Record<string, SocketBlueprint>,
> = InternalNodeBlueprint<typeof SvelteComponentDev, string, I, O>;

export type Node = InternalNode<typeof SvelteComponentDev>;
