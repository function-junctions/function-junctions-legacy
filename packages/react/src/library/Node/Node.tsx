import React from 'react';
import { NodeControlButtons } from 'core/components/NodeButton';
import { Editor, InputSocket, OutputSocket, Point } from 'core/types';
import NodeButton from '../NodeButton/NodeButton';
import Socket from '../Socket/Socket';

export type NodeProps = {
  title: string;
  id: string;
  inputs: Record<string, InputSocket<any>> | undefined;
  outputs: Record<string, OutputSocket<any>> | undefined;
  store?: Record<string, unknown>;
  editor: Editor;
};

export type NodeContainerProps = {
  title: string;
  id: string;
  inputs: Record<string, InputSocket<any>> | undefined;
  outputs: Record<string, OutputSocket<any>> | undefined;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  component: React.ComponentClass<NodeProps>;
  coordinates: Point;
  nodeControlButtons: NodeControlButtons | boolean;
  deletable?: boolean;
  cloneable?: boolean;
  selected?: boolean;
  store?: Record<string, unknown>;
  editor: Editor;
  onClick?: () => void;
  onMouseDown?: () => void;
  onTouchStart?: () => void;
  onContextMenu?: () => void;
};

const Node = ({
  title,
  id,
  inputs,
  outputs,
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
}: NodeContainerProps) => (
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
          <Component
            title={title}
            id={id}
            editor={editor}
            store={store}
            inputs={inputs}
            outputs={outputs}
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

export default Node;
