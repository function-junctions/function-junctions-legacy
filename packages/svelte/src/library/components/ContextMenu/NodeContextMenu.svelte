<script lang="ts">
  import type { Editor } from 'core/components/Editor';

  import type {
    ContextMenu as ContextMenuType,
    NodeContextMenuBlueprint,
  } from 'core/components/ContextMenu';
  import ContextMenu from './ContextMenu.svelte';
  import ContextMenuItem from './ContextMenuItem.svelte';

  export let ids: string[];

  export let editorInstance: Editor;
  export let instance: ContextMenuType | undefined = undefined;

  export let contextMenu: NodeContextMenuBlueprint;

  export let containerRef: HTMLDivElement;

  export let opened = false;
</script>

<ContextMenu {containerRef} bind:instance bind:opened>
  <ul on:click={() => instance?.close()}>
    {#if contextMenu.items && instance}
      {#each contextMenu.items as item}
        <ContextMenuItem {item} {ids} contextMenu={instance} editor={editorInstance} />
      {/each}
    {/if}
  </ul>
</ContextMenu>
