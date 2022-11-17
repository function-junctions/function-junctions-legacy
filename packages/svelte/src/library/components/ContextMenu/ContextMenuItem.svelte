<script lang="ts">
  import {
    type ContextMenuItem,
    type GenericContextMenuTypes,
    ContextMenu,
    getTruePosition,
  } from 'core/index';

  import type { Editor } from '../Editor';

  export let ids: string[] | undefined = undefined;
  export let item: ContextMenuItem<'delete' | 'clone' | GenericContextMenuTypes>;

  export let contextMenu: ContextMenu;

  export let editor: Editor;

  const { position: editorPosition } = editor;
</script>

{#if ids && item.type === 'delete'}
  <li
    on:click={() => {
      ids?.forEach((id) => {
        editor.deleteNode(id);
      });
      if (item.onClick) item.onClick();
    }}
  >
    {item.title ?? 'Delete'}
  </li>
{:else if ids && item.type === 'clone'}
  <li
    on:click={() => {
      const { x, y } = getTruePosition({
        x: (contextMenu?.x ?? 0) + 1,
        y: (contextMenu?.y ?? 0) + 1,
        translateX: $editorPosition.translateX,
        translateY: $editorPosition.translateY,
        originX: $editorPosition.originX,
        originY: $editorPosition.originY,
        scale: $editorPosition.scale,
      });

      ids?.forEach((id) => {
        void editor.cloneNode(id, { x, y });
      });

      if (item.onClick) item.onClick();
    }}
  >
    {item.title ?? 'Clone'}
  </li>
{:else if item.type === 'divider'}
  <div class="function-junctions-context_menu-divider" />
{:else if item.type === 'custom'}
  <li on:click={() => item.onClick && item.onClick()}>
    {item.title}
  </li>
{/if}
