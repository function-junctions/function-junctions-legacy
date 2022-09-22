import { EditorContextMenuProps } from 'core/components/ContextMenu';
import { getTruePosition } from 'core/components/Drag';
import React from 'react';
import { useReadable } from '../Hooks';
import ContextMenu from './ContextMenu';
import ContextMenuItem from './ContextMenuItem';

const EditorContextMenu = ({
  editorInstance,
  instance,
  contextMenu,
  containerRef,
  setInstance,
  setOpened,
}: EditorContextMenuProps) => {
  const { registered: nodesStore } = editorInstance.nodes;
  const { position: editorPositionStore } = editorInstance;

  const nodes = useReadable(nodesStore);
  const editorPosition = useReadable(editorPositionStore);

  return (
    <ContextMenu
      containerRef={containerRef}
      instance={instance}
      setInstance={setInstance}
      setOpened={setOpened}
    >
      <ul onClick={() => instance?.close()}>
        {contextMenu.nodes && (
          <>
            {Object.keys(nodes).map((key) => {
              <li
                onClick={() => {
                  const { x, y } = getTruePosition({
                    x: instance?.x ?? 0,
                    y: instance?.y ?? 0,
                    translateX: editorPosition.translateX,
                    translateY: editorPosition.translateY,
                    originX: editorPosition.originX,
                    originY: editorPosition.originY,
                    scale: editorPosition.scale,
                  });

                  editorInstance.addNode(key, { x, y });
                }}
              >
                {key}
              </li>;
            })}
          </>
        )}
        <div className="function-junctions-context_menu-divider" />
        {contextMenu.items && instance ? (
          <>
            {contextMenu.items.map((item, index) => (
              <ContextMenuItem
                key={index}
                item={item}
                contextMenu={instance}
                editor={editorInstance}
              />
            ))}
          </>
        ) : (
          <></>
        )}
      </ul>
    </ContextMenu>
  );
};

export default EditorContextMenu;
