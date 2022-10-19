import React from 'react';

import { InputSocket, InternalNode, OutputSocket } from '@function-junctions/core';
import { ReactComponent, ReactEditor } from '../Editor';
import { Updater } from '../Hooks';

export type RawNodeProps = {
  title: string;
  id: string;
  inputs: Record<string, InputSocket<any>> | undefined;
  outputs: Record<string, OutputSocket<any>> | undefined;
  component: ReactComponent;
  store?: Record<string, unknown>;
  editor: ReactEditor;
  updateNodes: Updater<
    Record<
      string,
      InternalNode<
        ReactComponent,
        React.CSSProperties,
        Record<string, InputSocket<any>>,
        Record<string, OutputSocket<any>>
      >
    >
  >;
};

const RawNode = ({
  title,
  id,
  inputs,
  outputs,
  component: Component,
  store = {},
  editor,
  updateNodes,
}: RawNodeProps) => {
  const [reactStore, setReactStore] = React.useState<Record<string, unknown>>(store);

  React.useEffect(() => {
    updateNodes((prevNodes) => ({
      ...prevNodes,
    }));
  }, [id, reactStore, updateNodes]);

  return (
    <div className="function-junctions-raw-node">
      <div className="function-junctions-raw-node-content">
        <Component
          title={title}
          id={id}
          editor={editor}
          store={store}
          inputs={inputs}
          outputs={outputs}
          setStore={setReactStore}
        />
      </div>
    </div>
  );
};

export default RawNode;
