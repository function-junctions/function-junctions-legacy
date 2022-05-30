<script lang="ts">
  import type { Editor } from '../Editor';
  
  import type { EditorContextMenuBlueprint } from '.';
  import { getTruePosition } from '../Drag';
  import ContextMenu from './ContextMenu.svelte';
  import type { ContextMenu as ContextMenuType } from '.';
  import ContextMenuItem from './ContextMenuItem.svelte';

  export let editorInstance: Editor;
  export let instance: ContextMenuType | undefined = undefined;

  export let contextMenu: EditorContextMenuBlueprint;

  export let containerRef: HTMLDivElement;

  export let opened = false;

  const { registered: nodes } = editorInstance.nodes;
  const { position: editorPosition } = editorInstance;
</script>

<ContextMenu
  {containerRef}
  bind:instance
  bind:opened
>
  <ul on:click={() => instance?.close()}>
    {#if contextMenu.nodes}
      {#each Object.keys($nodes) as key}
        <li on:click={() => {
          const { x, y } = getTruePosition({
            x: (instance?.x ?? 0),
            y: (instance?.y ?? 0),
            translateX: $editorPosition.translateX,
            translateY: $editorPosition.translateY,
            originX: $editorPosition.originX,
            originY: $editorPosition.originY,
            scale: $editorPosition.scale,
          });

          editorInstance.addNode(key, { x, y });
        }}>{key}</li>
      {/each}
      <div class="function-junctions-context_menu-divider" />
    {/if}
    {#if contextMenu.items && instance}
      {#each contextMenu.items as item}
        <ContextMenuItem
          {item}
          contextMenu={instance}
          editor={editorInstance}
        />
      {/each}
    {/if}
  </ul>
</ContextMenu>