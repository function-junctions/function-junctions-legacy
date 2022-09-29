import React from 'react';

import {
  NodeContextMenuBlueprint,
  ContextMenu as ContextMenuClass,
} from 'core/components/ContextMenu';
import ContextMenuItem from './ContextMenuItem';
import ContextMenu from './ContextMenu';
import { ReactEditor } from '../Editor';

export type NodeContextMenuProps = {
  ids: string[];
  editorInstance: ReactEditor;
  instance: ContextMenuClass;
  contextMenu: NodeContextMenuBlueprint;
  containerRef: React.RefObject<HTMLDivElement>;
  setInstance: React.Dispatch<React.SetStateAction<ContextMenuClass>>;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

const NodeContextMenu = ({
  ids,
  editorInstance,
  instance,
  contextMenu,
  containerRef,
  setInstance,
  setOpened,
}: NodeContextMenuProps) => {
  return (
    <ContextMenu
      containerRef={containerRef}
      instance={instance}
      setInstance={setInstance}
      setOpened={setOpened}
    >
      <ul onClick={() => instance?.close()}>
        {contextMenu.items && (
          <>
            {contextMenu.items.map((item) => {
              <ContextMenuItem
                item={item}
                ids={ids}
                contextMenu={instance}
                editor={editorInstance}
              />;
            })}
          </>
        )}
      </ul>
    </ContextMenu>
  );
};

export default NodeContextMenu;
