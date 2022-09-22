import React from 'react';

import { NodeContextMenuProps } from 'core/components/ContextMenu';
import ContextMenuItem from './ContextMenuItem';
import ContextMenu from './ContextMenu';

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
