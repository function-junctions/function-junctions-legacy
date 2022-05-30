<script lang="ts">
  import type { Editor } from '../Editor';
  
  import type { NodeContextMenuBlueprint } from '.';
  import ContextMenu from './ContextMenu.svelte';
  import type { ContextMenu as ContextMenuType } from '.';
  import ContextMenuItem from './ContextMenuItem.svelte';

  export let ids: string[];

  export let editorInstance: Editor;
  export let instance: ContextMenuType | undefined = undefined;

  export let contextMenu: NodeContextMenuBlueprint;

  export let containerRef: HTMLDivElement;

  export let opened = false;
</script>

<ContextMenu
  {containerRef}
  bind:instance
  bind:opened
>
  <ul on:click={() => instance?.close()}>
    {#if contextMenu.items && instance}
      {#each contextMenu.items as item}
        <ContextMenuItem
          {item}
          {ids}
          contextMenu={instance}
          editor={editorInstance}
        />
      {/each}
    {/if}
  </ul>
</ContextMenu>