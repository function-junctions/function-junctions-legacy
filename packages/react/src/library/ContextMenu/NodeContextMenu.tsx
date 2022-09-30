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
  instance: ContextMenuClass | undefined;
  contextMenu: NodeContextMenuBlueprint;
  containerRef: React.RefObject<HTMLDivElement>;
  setInstance: React.Dispatch<React.SetStateAction<ContextMenuClass | undefined>>;
  onOpened: (opened: boolean) => void;
};

const NodeContextMenu = ({
  ids,
  editorInstance,
  instance,
  contextMenu,
  containerRef,
  setInstance,
  onOpened,
}: NodeContextMenuProps) => {
  return (
    <ContextMenu
      containerRef={containerRef}
      instance={instance}
      setInstance={setInstance}
      onOpened={onOpened}
    >
      <ul onClick={() => instance?.close()}>
        {contextMenu.items && instance && (
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
