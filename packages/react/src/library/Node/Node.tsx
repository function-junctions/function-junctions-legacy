import React from 'react';
import { NodeControlButtons } from 'core/components/NodeButton';
import { InputSocket, OutputSocket, Point } from 'core/types';
import NodeButton from '../NodeButton/NodeButton';
import Socket from '../Socket/Socket';
import { ReactComponent, ReactEditor } from '../Editor';
import { Setter, Updater } from '../Hooks';
import { InputValueGenerator, OutputValueGenerator } from '../Socket';
import { ReactNodeProps } from '.';

export type NodeContainerProps = {
  title: string;
  id: string;
  inputs: Record<string, InputSocket<any>> | undefined;
  outputs: Record<string, OutputSocket<any>> | undefined;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  component: ReactComponent;
  coordinates: Point;
  nodeControlButtons: NodeControlButtons | boolean;
  deletable?: boolean;
  cloneable?: boolean;
  selected?: boolean;
  store?: Record<string, unknown>;
  editor: ReactEditor;
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
  onClick,
  onMouseDown,
  onTouchStart,
  onContextMenu,
}: NodeContainerProps) => {
  const [reactInputs, setReactInputs] = React.useState<Record<string, unknown>>({});
  const [reactOutputs, setReactOutputs] = React.useState<
    Record<string, [unknown, Setter<unknown>, Updater<unknown>]>
  >({});

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
          <div className="function-junctions-node-content">
            {inputs &&
              Object.keys(outputs ?? {}).map((key) => (
                <InputValueGenerator
                  value={outputs[key].value}
                  key={key}
                  get={(destructuredValue) =>
                    setReactInputs((prevOutputs) => ({
                      ...prevOutputs,
                      [key]: destructuredValue,
                    }))
                  }
                />
              ))}
            {outputs &&
              Object.keys(outputs ?? {}).map((key) => (
                <OutputValueGenerator
                  value={outputs[key].value}
                  key={key}
                  get={(destructuredValue) =>
                    setReactOutputs((prevOutputs) => ({
                      ...prevOutputs,
                      [key]: destructuredValue,
                    }))
                  }
                />
              ))}

            <Component
              title={title}
              id={id}
              editor={editor}
              store={store}
              inputs={{
                ...(() => {
                  const newInputs: ReactNodeProps['inputs'] = {};

                  Object.keys(inputs).forEach((key) => {
                    return {
                      ...((inputs ??= {})[key] ?? {}),
                      value: reactInputs[key],
                    };
                  });

                  return newInputs;
                })(),
              }}
              outputs={{
                ...(() => {
                  const newOutputs: ReactNodeProps['outputs'] = {};

                  Object.keys(outputs).forEach((key) => {
                    return {
                      ...((outputs ??= {})[key] ?? {}),
                      value: reactOutputs[key][0],
                      setValue: reactOutputs[key][1],
                    };
                  });

                  return newOutputs;
                })(),
              }}
            />
          </div>
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
