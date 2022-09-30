import type { SvelteComponentDev } from 'svelte/internal';
import type { InternalNodeBlueprint, InternalNode } from 'core/components/Nodes';
import type { SocketBlueprint } from 'core/components/Sockets';

export type NodeBlueprint<
  I = Record<string, SocketBlueprint>,
  O = Record<string, SocketBlueprint>,
> = InternalNodeBlueprint<typeof SvelteComponentDev, string, I, O>;

export type Node = InternalNode<typeof SvelteComponentDev>;
