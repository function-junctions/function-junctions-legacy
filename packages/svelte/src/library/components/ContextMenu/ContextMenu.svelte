<script lang="ts">
  import { onDestroy } from 'svelte';

  import type { Unsubscriber } from 'svelte/store';

  import { ContextMenu } from '@function-junctions/core';

  export let containerRef: HTMLDivElement;
  export let ref: HTMLDivElement | undefined = undefined;

  export let instance: ContextMenu | undefined = undefined;

  export let opened = false;

  let unsubscribe: Unsubscriber;

  $: (() => {
    if (ref) {
      if (!instance) {
        instance = new ContextMenu(ref, containerRef);
        const { opened: value } = instance;

        unsubscribe = value.subscribe((isOpened) => {
          opened = isOpened;
        });
      } else {
        instance.scope = containerRef;
      }
    }
  })();

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="function-junctions-context_menu" bind:this={ref}>
  <slot />
</div>
