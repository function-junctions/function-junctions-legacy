import { InternalEditor } from '../Editor';
import { InternalInputSocket, InternalOutputSocket } from '../Sockets';

export type InternalNodeProps<C, S = string> = {
  title: string;
  id: string;
  inputs: Record<string, InternalInputSocket<any>> | undefined;
  outputs: Record<string, InternalOutputSocket<any>> | undefined;
  store?: Record<string, unknown>;
  editor: InternalEditor<C, S>;
};
