export type NodeControlButtons = {
  clone: boolean;
  delete: boolean;
};

export type NodeButtonProps = {
  text: string;
  color?: string;
  background?: string;
  onClick?: () => void;
};
