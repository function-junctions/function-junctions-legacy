import React from 'react';
import { createConnectionPath, Point } from 'core/index';

export type ConnectionProps = {
  connection: { p1: Point; p2: Point };
};

const Connection = ({ connection }: ConnectionProps) => {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (ref.current) createConnectionPath(ref.current, { p1: connection.p1, p2: connection.p2 });
  }, [ref, connection.p1, connection.p2]);

  return <svg className="function-junctions-connection" ref={ref} />;
};

export default Connection;
