import React from 'react';

import { getTruePosition } from 'core/index';

import { useReadable } from '../Hooks';
import { Editor } from '../Editor';

import '../../../../../core/src/library/components/Socket/Socket.scss';

export type SocketProps = {
  title: string;
  type: 'input' | 'output';
  id: string;
  nodeId: string;
  socketType: string;
  disabled?: boolean;
  color?: string;
  editor: Editor;
};

const Socket = ({ title, type, id, nodeId, socketType, disabled, color, editor }: SocketProps) => {
  const [coordinates, setCoordinates] = React.useState<DOMRect>();
  const ref = React.useRef<HTMLDivElement>(null);

  const { position: positionStore, readonly: readonlyStore } = editor;
  const { current: nodesStore } = editor.nodes;

  const nodes = useReadable(nodesStore);
  const readonly = useReadable(readonlyStore);
  const position = useReadable(positionStore);

  const connect = React.useCallback(
    () => !readonly && editor.sockets.connect(type, { nodeId, socketId: id, socketType }),
    [readonly, editor, type, nodeId, id, socketType],
  );

  React.useEffect(() => {
    if (ref && ref.current) {
      setCoordinates(ref.current.getBoundingClientRect());
      const sockets = nodes[nodeId]?.[type === 'input' ? 'inputs' : 'outputs'];

      const { x, y } = getTruePosition({
        x: coordinates?.left ?? 0,
        y: coordinates?.top ?? 0,
        translateX: position.translateX,
        translateY: position.translateY,
        originX: position.originX,
        originY: position.originY,
        scale: position.scale,
      });

      if (sockets) sockets[id].coordinates = { x, y };
    }
  }, [coordinates?.left, coordinates?.top, id, nodeId, nodes, position, ref, type]);

  return (
    <div
      className={`function-junctions-socket function-junctions-socket-${type}`}
      onTouchStart={connect}
    >
      {type === 'output' && <div className="function-junctions-socket-title">{title}</div>}
      <div
        className={`function-junctions-socket-connection ${
          disabled ? 'function-junctions-socket-connection-disabled' : undefined
        }`}
        style={color ? { background: color } : {}}
        ref={ref}
        onClick={connect}
      />
      {type === 'input' && <div className="function-junctions-socket-title">{title}</div>}
    </div>
  );
};

export default Socket;
