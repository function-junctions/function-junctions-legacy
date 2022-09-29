import React from 'react';
import { getConnections } from 'core/components/Connections';
import { Point } from 'core/types';
import { useReadable } from '../Hooks';
import Connection from '../Connection/Connection';
import { ReactEditor } from '../Editor';

export type ConnectionsProps = {
  editor: ReactEditor;
};

const Connections = ({ editor }: ConnectionsProps) => {
  const { position: positionStore } = editor;
  const { current: nodesStore } = editor.nodes;
  const { restored: restoredStore } = editor.state;
  const { state: liveConnectionStore, show: showLiveConnectionStore } = editor.connection;

  const [connections, setConnections] = React.useState<{ p1: Point; p2: Point }[]>();

  const position = useReadable(positionStore);
  const nodes = useReadable(nodesStore);
  const restored = useReadable(restoredStore);
  const liveConnection = useReadable(liveConnectionStore);
  const showLiveConnection = useReadable(showLiveConnectionStore);

  React.useEffect(() => {
    getConnections(nodes)
      .then((newConnections) => {
        setConnections(newConnections);
      })
      .catch(() => console.error('Failed to get connections'));
  }, [restored, nodes, liveConnection, position]);

  return (
    <div className="function-junctions-connections">
      {connections?.map((connection, index) => (
        <Connection key={index} connection={connection} />
      ))}

      {showLiveConnection && liveConnection?.points ? (
        <Connection connection={liveConnection.points} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default Connections;
