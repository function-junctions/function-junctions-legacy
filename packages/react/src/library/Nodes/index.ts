import { NodeProps } from 'core/components/Node';
import type { InternalNodeBlueprint, InternalNode } from 'core/components/Nodes';

export type NodeBlueprint = InternalNodeBlueprint<
  React.ComponentClass<NodeProps<React.ComponentClass>>
>;
export type Node = InternalNode<React.ComponentClass<NodeProps<React.ComponentClass>>>;
