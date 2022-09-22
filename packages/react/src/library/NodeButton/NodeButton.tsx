import React from 'react';
import { NodeButtonProps } from 'core/components/NodeButton';

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
