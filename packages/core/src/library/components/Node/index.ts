import { Editor } from '../Editor';
import { InputSocket, OutputSocket } from '../Sockets';

export type NodeProps<C, S = string> = {
  title: string;
  id: string;
  inputs: Record<string, InputSocket<any>> | undefined;
  outputs: Record<string, OutputSocket<any>> | undefined;
  store?: Record<string, unknown>;
  editor: Editor<C, S>;
};
