import {
  EditorContextMenuProp,
  NodeContextMenuProp,
  NodeControlButtons,
  EditorState,
  getAppearance,
} from '@core/index';
import { Writable, writable } from 'svelte/store';
import { Editor as EditorClass } from '.';
import { NodeBlueprint } from '../Node';
import React from 'react';
import Nodes from '../Nodes/Nodes';
import { useReadable } from '../Hooks';

import '../../../../../core/src/library/components/Editor/Editor.scss';

export type EditorProps = {
  nodes: Record<string, NodeBlueprint>;

  inputs?: Record<string, { type: string; value: Writable<unknown> }>;
  outputs?: Record<string, { type: string; value: Writable<unknown> }>;

  state?: EditorState;
  setState?: React.Dispatch<React.SetStateAction<EditorState | undefined>>;

  multiselect?: boolean;
  zoomable?: boolean;
  pannable?: boolean;
  moveable?: boolean;
  interactable?: boolean;
  editable?: boolean;

  editorContextMenu?: EditorContextMenuProp;
  nodeContextMenu?: NodeContextMenuProp;

  nodeControlButtons?: NodeControlButtons | boolean;

  appearance?: 'light' | 'dark' | 'auto';

  className?: string;
  style?: React.CSSProperties;

  onReady?: (editor: EditorClass) => void;
};

const Editor = ({
  nodes,
  inputs,
  outputs,
  state: defaultState,
  setState: defaultSetState,
  multiselect = true,
  zoomable = true,
  pannable = true,
  moveable = true,
  interactable = true,
  editable = true,
  editorContextMenu,
  nodeContextMenu,
  nodeControlButtons = {
    delete: true,
    clone: true,
  },
  appearance = 'auto',
  className,
  style,
  onReady,
}: EditorProps) => {
  const [state, setState] = React.useState<EditorState | undefined>(defaultState);
  const [instance, setInstance] = React.useState<EditorClass>(
    new EditorClass({
      blueprint: writable(nodes),
      state,
      readonly: !editable,
      inputs,
      outputs,
    }),
  );

  React.useEffect(() => {
    setInstance((prevInstance) => {
      if (prevInstance.state.restored) return prevInstance;

      return new EditorClass({
        blueprint: writable(nodes),
        state,
        readonly: !editable,
        inputs,
        outputs,
      });
    });
  }, [editable, inputs, nodes, outputs, state]);

  const appearanceClassNameStore = React.useMemo(() => getAppearance(appearance), [appearance]);

  const appearanceClassName = useReadable(appearanceClassNameStore);

  React.useEffect(() => {
    instance.inputs = inputs;
    instance.outputs = outputs;
  }, [inputs, outputs, instance]);

  React.useEffect(() => {
    defaultSetState?.(state);
  }, [defaultSetState, state]);

  return (
    <div
      className={`function-junctions-editor function-junctions-appearance-${appearanceClassName} ${
        className ?? ''
      }`}
      style={style}
    >
      <Nodes
        editor={instance}
        multiselect={multiselect}
        zoomable={zoomable}
        pannable={pannable}
        moveable={moveable}
        interactable={interactable}
        editorContextMenu={editorContextMenu}
        nodeContextMenu={nodeContextMenu}
        nodeControlButtons={nodeControlButtons}
        onReady={onReady}
        state={state}
        setState={setState}
      />
    </div>
  );
};

export default Editor;
