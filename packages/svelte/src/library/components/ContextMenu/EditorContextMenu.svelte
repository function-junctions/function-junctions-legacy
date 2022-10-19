<script lang="ts">
  import {
    type EditorContextMenuBlueprint,
    type ContextMenu as ContextMenuType,
    getTruePosition,
  } from '@function-junctions/core';
  import ContextMenu from './ContextMenu.svelte';
  import ContextMenuItem from './ContextMenuItem.svelte';
  import type { SvelteEditor } from '../Editor';

  export let editorInstance: SvelteEditor;
  export let instance: ContextMenuType | undefined = undefined;

  export let contextMenu: EditorContextMenuBlueprint;

  export let containerRef: HTMLDivElement;

  export let opened = false;

  const { registered: nodes } = editorInstance.nodes;
  const { position: editorPosition } = editorInstance;
</script>

<ContextMenu {containerRef} bind:instance bind:opened>
  <ul on:click={() => instance?.close()}>
    {#if contextMenu.nodes}
      {#each Object.keys($nodes) as key}
        <li
          on:click={() => {
            const { x, y } = getTruePosition({
              x: instance?.x ?? 0,
              y: instance?.y ?? 0,
              translateX: $editorPosition.translateX,
              translateY: $editorPosition.translateY,
              originX: $editorPosition.originX,
              originY: $editorPosition.originY,
              scale: $editorPosition.scale,
            });

            console.log({ truePosition: { x, y }, position: { x: instance?.x, y: instance?.y } });

            editorInstance.addNode(key, { x, y });
          }}
        >
          {key}
        </li>
      {/each}
      <div class="function-junctions-context_menu-divider" />
    {/if}
    {#if contextMenu.items && instance}
      {#each contextMenu.items as item}
        <ContextMenuItem {item} contextMenu={instance} editor={editorInstance} />
      {/each}
    {/if}
  </ul>
</ContextMenu>
