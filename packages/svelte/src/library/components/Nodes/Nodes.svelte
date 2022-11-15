<script lang="ts">
  import {
    type EditorState,
    type NodeControlButtons,
    type ContextMenu,
    getMatrix,
    Interaction,
    Drag,
  } from 'core/index';
  import Node from '../Node/Node.svelte';
  import Connections from '../Connections/Connections.svelte';

  import type { EditorContextMenuProp, NodeContextMenuProp } from 'core/components/ContextMenu';
  import EditorContextMenu from '../ContextMenu/EditorContextMenu.svelte';
  import NodeContextMenu from '../ContextMenu/NodeContextMenu.svelte';
  import type { Editor } from '../Editor';
  import { onMount } from 'svelte';

  export let editor: Editor;
  export let state: EditorState | undefined;

  export let multiselect: boolean;
  export let zoomable: boolean;
  export let pannable: boolean;
  export let moveable: boolean;
  export let interactable: boolean;

  export let nodeControlButtons: NodeControlButtons | boolean;

  export let editorContextMenu: EditorContextMenuProp;
  export let nodeContextMenu: NodeContextMenuProp;

  export let onReady: ((editor: Editor) => void) | undefined = undefined;

  let ref: HTMLDivElement;

  const { position } = editor;
  const { current: nodes } = editor.nodes;
  const { restored: stateRestored, nodes: nodesState } = editor.state;
  const { show: showLiveConnection, state: liveConnectionState } = editor.connection;

  let editorContextMenuInstance: ContextMenu;
  let nodeContextMenuInstance: ContextMenu;

  const interaction = new Interaction(nodes, position, undefined, {
    multiselect,
    zoomable,
    pannable,
    moveable,
  });

  const hideLiveConnection = () => $liveConnectionState && ($showLiveConnection = false);

  $: $nodes,
    (() => {
      if (stateRestored) editor.updateState();
    })();

  $: $nodesState,
    $position,
    (state = {
      nodes: $nodesState,
      position: $position,
    });

  $: if (stateRestored && onReady) onReady(editor);

  onMount(() => {
    interaction.dragger = Drag({
      scaleSensitivity: 100,
      minScale: 0.1,
      maxScale: 30,
      element: ref,
      transformation: position,
    });
  });

  $: {
    interaction.editorContextMenu = (() => {
      if (typeof editorContextMenu === 'function')
        return { type: 'callback', callback: editorContextMenu };
      return {
        type: 'instance',
        instance: editorContextMenuInstance,
        blueprint: editorContextMenu,
      };
    })();

    interaction.nodeContextMenu = (() => {
      if (typeof nodeContextMenu === 'function')
        return { type: 'callback', callback: nodeContextMenu };
      return {
        type: 'instance',
        instance: nodeContextMenuInstance,
        blueprint: nodeContextMenu,
      };
    })();
  }
</script>

<div
  class="function-junctions-nodes"
  on:click={(event) => {
    hideLiveConnection();

    editorContextMenuInstance?.evaluate(event);
    nodeContextMenuInstance?.evaluate(event);
  }}
  on:wheel={interaction.zoom}
  on:mousedown={interaction.startDrag}
  on:mouseup={interaction.endDrag}
  on:mousemove={interaction.drag}
  on:touchstart={interaction.startDrag}
  on:touchend={interaction.endDrag}
  on:touchmove={interaction.touch}
  on:contextmenu={interaction.openEditorContextMenu}
>
  {#if editorContextMenu && typeof editorContextMenu !== 'function'}
    <EditorContextMenu
      containerRef={ref}
      contextMenu={editorContextMenu}
      bind:instance={editorContextMenuInstance}
      bind:editorInstance={editor}
      bind:opened={interaction.contextMenuOpen}
    />
  {/if}

  {#if nodeContextMenu && typeof nodeContextMenu !== 'function'}
    <NodeContextMenu
      containerRef={ref}
      contextMenu={nodeContextMenu}
      ids={interaction.selectedNodesIds}
      bind:instance={nodeContextMenuInstance}
      bind:editorInstance={editor}
      bind:opened={interaction.contextMenuOpen}
    />
  {/if}

  <div
    class="function-junctions-nodes-zoom"
    style={`
      transform-origin: ${$position.originX}px ${$position.originY}px;
      transform: ${getMatrix({
        scale: $position.scale,
        translateX: $position.translateX,
        translateY: $position.translateY,
      })};
      touch-action: none;
    `}
    bind:this={ref}
  >
    <Connections {editor} />
    {#each Object.keys($nodes) as key (key)}
      {#if $nodes[key] && $nodesState[key]}
        <Node
          title={$nodes[key]?.title ?? $nodes[key].type}
          id={key}
          component={$nodes[key].component}
          inputs={$nodes[key].inputs}
          outputs={$nodes[key].outputs}
          coordinates={{
            x: $nodes[key].x,
            y: $nodes[key].y,
          }}
          color={$nodes[key].color}
          className={`${$nodes[key].className ?? ''} ${
            !interactable ? 'function-junction-node-disabled' : ''
          }`}
          style={$nodes[key].style ?? ''}
          selected={interaction.selectedNodesIds.some((selectedNodeId) => key === selectedNodeId)}
          cloneable={$nodes[key].cloneable}
          deletable={$nodes[key].deletable}
          {nodeControlButtons}
          {editor}
          bind:store={$nodesState[key].store}
          on:mousedown={(event) => interaction.dragNode(event, key)}
          on:touchstart={(event) => interaction.dragNode(event, key)}
          on:contextmenu={(event) => interaction.openNodeContextMenu(event, key)}
        />
      {/if}
    {/each}
  </div>
</div>
