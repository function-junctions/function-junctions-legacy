import { InternalEditor, InternalEditorOptions } from 'core/index';
import React from 'react';
import { NodeProps } from '../Node';

export type ReactComponent<T = unknown> = (props: NodeProps & T) => JSX.Element;
export class Editor extends InternalEditor<ReactComponent, React.CSSProperties> {
  constructor(options: InternalEditorOptions<ReactComponent, React.CSSProperties>) {
    super(options);
  }
}
