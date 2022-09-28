import React from 'react';

import { Editor, InputSocket, OutputSocket } from 'core/types';
import { NodeProps } from './Node';

export type RawNodeProps = {
  title: string;
  id: string;
  inputs: Record<string, InputSocket<any>> | undefined;
  outputs: Record<string, OutputSocket<any>> | undefined;
  component: React.ComponentClass<NodeProps>;
  store?: Record<string, unknown>;
  editor: Editor;
};

const RawNode = ({
  title,
  id,
  inputs,
  outputs,
  component: Component,
  store = {},
  editor,
}: RawNodeProps) => (
  <div className="function-junctions-raw-node">
    <div className="function-junctions-raw-node-content">
      <Component
        title={title}
        id={id}
        editor={editor}
        store={store}
        inputs={inputs}
        outputs={outputs}
      />
    </div>
  </div>
);

export default RawNode;
