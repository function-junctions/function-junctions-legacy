import React from 'react';
import {
  NodeControlButtons,
  InternalInputSocket,
  InternalNode,
  InternalOutputSocket,
  Point,
} from 'core/index';
import NodeButton from '../NodeButton/NodeButton';
import Socket from '../Socket/Socket';
import { ReactComponent, Editor } from '../Editor';
import { Setter, Updater } from '../Hooks';
import { InputValueGenerator, OutputValueGenerator } from '../Socket';
import { NodeProps } from '.';

import '../../../../../core/src/library/components/Node/Node.scss';

export type NodeContainerProps = {
  title: string;
  id: string;
  inputs: Record<string, InternalInputSocket<any>> | undefined;
  outputs: Record<string, InternalOutputSocket<any>> | undefined;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  component: ReactComponent<Point>;
  coordinates: Point;
  nodeControlButtons: NodeControlButtons | boolean;
  deletable?: boolean;
  cloneable?: boolean;
  selected?: boolean;
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
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
};

const Node = ({
  title,
  id,
  inputs = {},
  outputs = {},
  color,
  className,
  style,
  component: Component,
  coordinates,
  nodeControlButtons,
  deletable,
  cloneable,
  selected,
  store = {},
  editor,
  updateNodes,
  onClick,
  onMouseDown,
  onTouchStart,
  onContextMenu,
}: NodeContainerProps) => {
  const [reactInputs, setReactInputs] = React.useState<Record<string, unknown>>();
  const [reactOutputs, setReactOutputs] =
    React.useState<Record<string, [unknown, Setter<unknown>, Updater<unknown>]>>();
  const [reactStore, setReactStore] = React.useState<Record<string, unknown>>(store);

  const computedReactInputs = React.useMemo(() => {
    if (reactInputs) {
      const newInputs: NodeProps['inputs'] = {};

      Object.keys(inputs).forEach((key) => {
        newInputs[key] = {
          ...(inputs[key] ?? {}),
          value: reactInputs?.[key],
        };
      });

      return newInputs;
    } else if (Object.keys(inputs).length < 1) setReactInputs({});

    return;
  }, [inputs, reactInputs]);

  const computedReactOutputs = React.useMemo(() => {
    if (reactOutputs) {
      const newOutputs: NodeProps['outputs'] = {};

      Object.keys(outputs).forEach((key) => {
        newOutputs[key] = {
          ...(outputs[key] ?? {}),
          value: reactOutputs[key]?.[0],
          setValue: reactOutputs[key]?.[1],
        };
      });

      return newOutputs;
    } else if (Object.keys(outputs).length < 1) setReactOutputs({});
    return;
  }, [outputs, reactOutputs]);

  React.useEffect(() => {
    updateNodes((prevNodes) => ({
      ...prevNodes,
      [id]: {
        ...prevNodes[id],
        store: reactStore,
      },
    }));
  }, [id, reactStore, updateNodes]);

  return (
    <>
      <div
        className={`function-junctions-node ${selected ? 'function-junctions-node-selected' : ''} ${
          className ?? ''
        }`}
        style={{ ...style, transform: `translate(${coordinates.x}px, ${coordinates.y}px)` }}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onContextMenu={onContextMenu}
      >
        {cloneable ??
        ((typeof nodeControlButtons === 'boolean' && nodeControlButtons) ||
          (typeof nodeControlButtons === 'object' && nodeControlButtons.clone)) ? (
          <div className="function-junctions-node-header">
            <NodeButton
              text="Clone"
              onClick={() => editor.cloneNode(id, { x: coordinates.x + 50, y: coordinates.y + 50 })}
            />
          </div>
        ) : (
          <></>
        )}
        <div
          className="function-junctions-node-title"
          style={{ background: `${color ?? 'linear-gradient(#228cfd, #007aff)'}` }}
        >
          {title}
        </div>
        <div className="function-junctions-node-content">
          {outputs ? (
            <div className="function-junctions-node-outputs">
              {Object.keys(outputs).map((key) => (
                <Socket
                  title={key}
                  key={key}
                  type="output"
                  id={key}
                  nodeId={id}
                  color={outputs[key].color}
                  socketType={outputs[key].type}
                  disabled={outputs[key].disabled}
                  editor={editor}
                />
              ))}
            </div>
          ) : (
            <></>
          )}
          {Component && (
            <div className="function-junctions-node-content">
              {inputs &&
                Object.keys(inputs ?? {}).map((key) => (
                  <InputValueGenerator
                    value={inputs[key].value}
                    key={key}
                    id={key}
                    setReactInputs={setReactInputs}
                  />
                ))}
              {outputs &&
                Object.keys(outputs ?? {}).map((key) => (
                  <OutputValueGenerator
                    value={outputs[key].value}
                    key={key}
                    id={key}
                    nodeId={id}
                    updateNodes={updateNodes}
                    setReactOutputs={setReactOutputs}
                    outputs={outputs}
                  />
                ))}

              {computedReactInputs && computedReactOutputs && (
                <Component
                  title={title}
                  id={id}
                  editor={editor}
                  store={reactStore}
                  setStore={setReactStore}
                  inputs={computedReactInputs}
                  outputs={computedReactOutputs}
                  x={coordinates.x}
                  y={coordinates.y}
                />
              )}
            </div>
          )}
          {inputs ? (
            <div className="function-junctions-node-inputs">
              {Object.keys(inputs).map((key) => (
                <Socket
                  title={key}
                  key={key}
                  type="input"
                  id={key}
                  nodeId={id}
                  socketType={inputs[key].type}
                  color={inputs[key].color}
                  disabled={inputs[key].disabled}
                  editor={editor}
                />
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>
        {deletable ??
        ((typeof nodeControlButtons === 'boolean' && nodeControlButtons) ||
          (typeof nodeControlButtons === 'object' && nodeControlButtons.delete)) ? (
          <div className="function-junctions-node-footer">
            <NodeButton
              text="Delete"
              color="rgb(255, 59, 48)"
              onClick={() => editor.deleteNode(id)}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Node;
