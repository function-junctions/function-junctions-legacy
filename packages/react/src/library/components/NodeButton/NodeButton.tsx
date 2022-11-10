import React from 'react';

import '../../../../../core/src/library/components/NodeButton/NodeButton.scss';

export type NodeButtonProps = {
  text: string;
  color?: string;
  background?: string;
  onClick?: () => void;
};

const NodeButton = ({ text, color, background, onClick }: NodeButtonProps) => (
  <button
    className="function-junctions-node_button"
    style={{
      color,
      background,
    }}
    onClick={onClick}
  >
    {text}
  </button>
);

export default NodeButton;
