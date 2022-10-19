import type { Editor } from 'core/index';
import React from 'react';
import { ReactNodeProps } from '../Node';

export type ReactComponent = (props: ReactNodeProps) => JSX.Element;

export type ReactEditor = Editor<ReactComponent, React.CSSProperties>;
