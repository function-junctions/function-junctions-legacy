import React from 'react';
import {
  ContextMenu,
  EditorContextMenuProp,
  NodeContextMenuProp,
} from 'core/components/ContextMenu';
import { NodeControlButtons } from 'core/components/NodeButton';
import { EditorState } from 'core/types';
import { ReactEditor } from '../Editor';
import { useReadable, useWritable } from '../Hooks';
import { Interaction } from 'core/components/Interaction';
import Drag, { getMatrix } from 'core/components/Drag';
import EditorContextMenu from '../ContextMenu/EditorContextMenu';
import Node from '../Node/Node';
import NodeContextMenu from '../ContextMenu/NodeContextMenu';
import Connections from '../Connections/Connections';

export type NodesProps = {
  editor: ReactEditor;
  state: EditorState | undefined;
  setState: React.Dispatch<React.SetStateAction<EditorState | undefined>>;

  multiselect: boolean;
  zoomable: boolean;
  pannable: boolean;
  moveable: boolean;
  interactable: boolean;
  nodeControlButtons: NodeControlButtons | boolean;

  editorContextMenu: EditorContextMenuProp;
  nodeContextMenu: NodeContextMenuProp;

  onReady: ((editor: ReactEditor) => void) | undefined;
};

const Nodes = ({
  editor,
  setState,
  multiselect,
  zoomable,
  pannable,
  moveable,
  interactable,
  nodeControlButtons,
  editorContextMenu,
  nodeContextMenu,
  onReady,
}: NodesProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const { position: positionStore } = editor;
  const { current: nodesStore } = editor.nodes;
  const { restored: stateRestoredStore, nodes: nodesStateStore } = editor.state;
  const { show: showLiveConnectionStore, state: liveConnectionStateStore } = editor.connection;

  const position = useReadable(positionStore);
  const [nodes, , updateNodes] = useWritable(nodesStore);

  const stateRestored = useReadable(stateRestoredStore);
  const nodesState = useReadable(nodesStateStore);

  const [, setShowLiveConnection] = useWritable(showLiveConnectionStore);
  const liveConnectionState = useReadable(liveConnectionStateStore);

  const interaction = React.useMemo(
    () =>
      new Interaction(nodesStore, positionStore, undefined, {
        multiselect,
        zoomable,
        pannable,
        moveable,
      }),
    [moveable, multiselect, nodesStore, pannable, positionStore, zoomable],
  );

  const [editorContextMenuInstance, setEditorContextMenuInstance] = React.useState<ContextMenu>();
  const [nodeContextMenuInstance, setNodeContextMenuInstance] = React.useState<ContextMenu>();

  const hideLiveConnection = React.useCallback(
    () => liveConnectionState && setShowLiveConnection(false),
    [liveConnectionState, setShowLiveConnection],
  );

  React.useEffect(() => {
    if (stateRestored) editor.updateState();
  }, [nodes, stateRestored, editor]);

  React.useEffect(
    () =>
      setState({
        nodes: nodesState,
        position,
      }),
    [position, setState],
  );

  React.useEffect(() => {
    if (stateRestored && onReady) onReady(editor);
  }, [onReady, editor, stateRestored]);

  React.useEffect(() => {
    if (ref.current)
      interaction.dragger = Drag({
        scaleSensitivity: 100,
        minScale: 0.1,
        maxScale: 30,
        element: ref.current,
        transformation: positionStore,
      });
  }, [interaction, positionStore, ref]);

  React.useEffect(() => {
    if (editorContextMenuInstance && editorContextMenu)
      interaction.editorContextMenu = (() => {
        if (typeof editorContextMenu === 'function')
          return { type: 'callback', callback: editorContextMenu };
        return {
          type: 'instance',
          instance: editorContextMenuInstance,
          blueprint: editorContextMenu,
        };
      })();
    if (nodeContextMenuInstance && nodeContextMenu)
      interaction.nodeContextMenu = (() => {
        if (typeof nodeContextMenu === 'function')
          return { type: 'callback', callback: nodeContextMenu };
        return {
          type: 'instance',
          instance: nodeContextMenuInstance,
          blueprint: nodeContextMenu,
        };
      })();
  }, [
    editorContextMenu,
    editorContextMenuInstance,
    interaction,
    nodeContextMenu,
    nodeContextMenuInstance,
  ]);

  return (
    <div
      className="function-junctions-nodes"
      onClick={(event) => {
        hideLiveConnection();

        editorContextMenuInstance?.evaluate(event.nativeEvent);
        nodeContextMenuInstance?.evaluate(event.nativeEvent);
      }}
      onWheel={({ nativeEvent }) => interaction.zoom(nativeEvent)}
      onMouseDown={({ nativeEvent }) => interaction.startDrag(nativeEvent)}
      onMouseUp={interaction.endDrag}
      onMouseMove={({ nativeEvent }) => interaction.drag(nativeEvent)}
      onTouchStart={({ nativeEvent }) => interaction.startDrag(nativeEvent)}
      onTouchEnd={interaction.endDrag}
      onTouchMove={({ nativeEvent }) => interaction.touch(nativeEvent)}
      onContextMenu={({ nativeEvent }) => interaction.openEditorContextMenu(nativeEvent)}
    >
      {editorContextMenu && typeof editorContextMenu !== 'function' && (
        <EditorContextMenu
          containerRef={ref}
          contextMenu={editorContextMenu}
          instance={editorContextMenuInstance}
          setInstance={setEditorContextMenuInstance}
          editorInstance={editor}
          onOpened={(opened) => {
            interaction.contextMenuOpen = opened;
          }}
        />
      )}

      {nodeContextMenu && typeof nodeContextMenu !== 'function' && (
        <NodeContextMenu
          containerRef={ref}
          contextMenu={nodeContextMenu}
          ids={interaction.selectedNodesIds}
          instance={nodeContextMenuInstance}
          setInstance={setNodeContextMenuInstance}
          editorInstance={editor}
          onOpened={(opened) => {
            interaction.contextMenuOpen = opened;
          }}
        />
      )}

      <div
        className="function-junctions-nodes-zoom"
        style={{
          transformOrigin: `${position.originX}px ${position.originY}px`,
          scale: position.scale,
          transform: `${getMatrix({
            scale: position.scale,
            translateX: position.translateX,
            translateY: position.translateY,
          })}`,
          touchAction: 'none',
        }}
        ref={ref}
      >
        <Connections editor={editor} />
        {Object.keys(nodes).map((key) => {
          if (nodes[key] && nodesState[key])
            return (
              <Node
                title={nodes[key].type}
                id={key}
                component={nodes[key].component}
                inputs={nodes[key].inputs}
                outputs={nodes[key].outputs}
                coordinates={{
                  x: nodes[key].x,
                  y: nodes[key].y,
                }}
                color={nodes[key].color}
                className={`${nodes[key].className ?? ''} ${
                  !interactable ? 'function-junction-node-disabled' : ''
                }`}
                updateNodes={updateNodes}
                style={nodes[key].style}
                selected={interaction.selectedNodesIds.some(
                  (selectedNodeId) => key === selectedNodeId,
                )}
                cloneable={nodes[key].cloneable}
                deletable={nodes[key].deletable}
                nodeControlButtons={nodeControlButtons}
                editor={editor}
                store={nodesState[key].store}
                onMouseDown={({ nativeEvent }) => interaction.dragNode(nativeEvent, key)}
                onTouchStart={({ nativeEvent }) => interaction.dragNode(nativeEvent, key)}
                onContextMenu={({ nativeEvent }) =>
                  interaction.openNodeContextMenu(nativeEvent, key)
                }
              />
            );
        })}
      </div>
    </div>
  );
};

export default Nodes;
