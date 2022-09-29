import { NodeProps } from 'core/components/Node';
import type { Editor } from 'core/types';

export type ReactEditor = Editor<React.ComponentClass<NodeProps<React.ComponentClass>>>;
