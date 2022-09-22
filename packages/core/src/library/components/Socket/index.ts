import { Editor } from '../Editor';

export type SocketProps = {
  title: string;
  type: 'input' | 'output';
  id: string;
  nodeId: string;
  socketType: string;
  disabled?: boolean;
  color?: string;
  editor: Editor;
};
