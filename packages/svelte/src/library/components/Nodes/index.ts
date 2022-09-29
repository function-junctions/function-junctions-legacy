import type { SvelteComponentDev } from 'svelte/internal';
import type { InternalNodeBlueprint, InternalNode } from 'core/components/Nodes';

export type NodeBlueprint = InternalNodeBlueprint<typeof SvelteComponentDev>;
export type Node = InternalNode<typeof SvelteComponentDev>;
