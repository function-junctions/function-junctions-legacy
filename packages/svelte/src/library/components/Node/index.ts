import type { SvelteComponentDev } from 'svelte/internal';
import type {
  InternalNodeBlueprint,
  InternalNode,
  SocketBlueprint,
  InternalNodeProps,
} from 'core/index';

export type NodeBlueprint<
  I = Record<string, SocketBlueprint>,
  O = Record<string, SocketBlueprint>,
> = InternalNodeBlueprint<typeof SvelteComponentDev, string, I, O>;

export type Node = InternalNode<typeof SvelteComponentDev>;

export type NodeProps = InternalNodeProps<typeof SvelteComponentDev>;
