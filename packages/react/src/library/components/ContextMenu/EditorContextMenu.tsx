import {
  EditorContextMenuBlueprint,
  ContextMenu as ContextMenuClass,
  getTruePosition,
} from 'core/index';
import React from 'react';
import { Editor } from '../Editor';
import { useReadable } from '../Hooks';
import ContextMenu from './ContextMenu';
import ContextMenuItem from './ContextMenuItem';

export type EditorContextMenuProps = {
  editorInstance: Editor;
  instance: ContextMenuClass | undefined;
  contextMenu: EditorContextMenuBlueprint;
  containerRef: React.RefObject<HTMLDivElement>;
  setInstance: React.Dispatch<React.SetStateAction<ContextMenuClass | undefined>>;
  onOpened: (opened: boolean) => void;
};

const EditorContextMenu = ({
  editorInstance,
  instance,
  contextMenu,
  containerRef,
  setInstance,
  onOpened,
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
      onOpened={onOpened}
    >
      <ul onClick={() => instance?.close()}>
        {contextMenu.nodes && (
          <>
            {Object.keys(nodes).map((key) => {
              return (
                <li
                  key={key}
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
                </li>
              );
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
