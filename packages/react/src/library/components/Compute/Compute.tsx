import { EditorState } from '@core/index';
import React from 'react';
import { Writable, writable } from 'svelte/store';
import { Editor } from '../Editor';
import { useReadable, useWritable } from '../Hooks';
import RawNode from '../Node/RawNode';
import { NodeBlueprint } from '../Node';

import '../../../../../core/src/library/components/Compute/Compute.scss';

export type ComputeProps = {
  nodes: Record<string, NodeBlueprint>;
  state: EditorState;
  inputs?: Record<string, { type: string; value: Writable<unknown> }>;
  outputs?: Record<string, { type: string; value: Writable<unknown> }>;
};

const Compute = ({ nodes, state, inputs = {}, outputs = {} }: ComputeProps) => {
  const [instance] = React.useState<Editor>(
    new Editor({
      blueprint: writable(nodes),
      state,
      readonly: true,
      inputs,
      outputs,
    }),
  );

  const { current: currentNodesStore } = instance.nodes;
  const { nodes: nodesStateStore } = instance.state;

  const [currentNodes, , updateNodesState] = useWritable(currentNodesStore);
  const nodesState = useReadable(nodesStateStore);

  return (
    <div className="function-junctions-compute">
      {Object.keys(currentNodes).map((key) => {
        if (currentNodes[key] && nodesState[key])
          <RawNode
            title={currentNodes[key].type}
            id={key}
            component={currentNodes[key].component}
            inputs={currentNodes[key].inputs}
            outputs={currentNodes[key].outputs}
            editor={instance}
            store={nodesState[key].store}
            updateNodes={updateNodesState}
          />;

        return <></>;
      })}
    </div>
  );
};

export default Compute;
