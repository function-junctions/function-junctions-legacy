import { DragPoints } from '../Drag';
import { NodesState } from '../Nodes';

export type EditorState = {
  nodes: NodesState;
  coordinates: DragPoints;
}
