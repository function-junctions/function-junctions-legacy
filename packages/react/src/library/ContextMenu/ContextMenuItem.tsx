import {
  GenericContextMenuTypes,
  ContextMenuItem as ContextMenuItemType,
  ContextMenu,
} from 'core/components/ContextMenu';
import { getTruePosition } from 'core/components/Drag';
import { Editor } from 'core/types';
import React from 'react';
import { ReactEditor } from '../Editor';
import { useReadable } from '../Hooks';

export type ContextMenuItemProps = {
  ids?: string[];
  item: ContextMenuItemType<'delete' | 'clone' | GenericContextMenuTypes>;
  contextMenu: ContextMenu;
  editor: ReactEditor;
};

const ContextMenuItem = ({ ids, item, contextMenu, editor }: ContextMenuItemProps) => {
  const { position: editorPositionStore } = editor;

  const editorPosition = useReadable(editorPositionStore);

  const render = React.useCallback(() => {
    if (ids) {
      switch (item.type) {
        case 'delete':
          return (
            <li
              onClick={() => {
                ids?.forEach((id) => {
                  editor.deleteNode(id);
                });
                if (item.onClick) item.onClick();
              }}
            >
              {item.title ?? 'Delete'}
            </li>
          );

        case 'clone':
          return (
            <li
              onClick={() => {
                const { x, y } = getTruePosition({
                  x: (contextMenu?.x ?? 0) + 1,
                  y: (contextMenu?.y ?? 0) + 1,
                  translateX: editorPosition.translateX,
                  translateY: editorPosition.translateY,
                  originX: editorPosition.originX,
                  originY: editorPosition.originY,
                  scale: editorPosition.scale,
                });

                ids?.forEach((id) => {
                  editor.cloneNode(id, { x, y });
                });

                if (item.onClick) item.onClick();
              }}
            >
              {item.title ?? 'Clone'}
            </li>
          );

        case 'divider':
          return <li className="function-junctions-context-menu-divider" />;
        case 'custom':
          return <li onClick={() => item.onClick && item.onClick()}>{item.title}</li>;
      }
    }
  }, [
    contextMenu?.x,
    contextMenu?.y,
    editor,
    editorPosition.originX,
    editorPosition.originY,
    editorPosition.scale,
    editorPosition.translateX,
    editorPosition.translateY,
    ids,
    item,
  ]);

  return <>{render()}</>;
};

export default ContextMenuItem;
