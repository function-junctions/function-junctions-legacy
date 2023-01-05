import React from 'react';

import { InternalInputSocket, InternalNode, InternalOutputSocket } from '@core/index';
import { ReactComponent, Editor } from '../Editor';
import { Updater } from '../Hooks';

import '../../../../../core/src/library/components/Node/RawNode.scss';

export type RawNodeProps = {
  title: string;
  id: string;
  inputs: Record<string, InternalInputSocket<any>> | undefined;
  outputs: Record<string, InternalOutputSocket<any>> | undefined;
  component: ReactComponent;
  store?: Record<string, unknown>;
  editor: Editor;
  updateNodes: Updater<
    Record<
      string,
      InternalNode<
        ReactComponent,
        React.CSSProperties,
        Record<string, InternalInputSocket<any>>,
        Record<string, InternalOutputSocket<any>>
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
