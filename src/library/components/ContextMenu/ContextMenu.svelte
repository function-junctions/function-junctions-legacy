<style lang="scss" global>
  @import './ContextMenu.scss';
</style>

<script lang="ts">
import { onDestroy } from 'svelte';

import type { Unsubscriber } from 'svelte/store';


import { ContextMenu } from '.';

export let containerRef: HTMLDivElement;
export let ref: HTMLDivElement | undefined = undefined;

export let instance: ContextMenu | undefined = undefined;

export let opened = false;

let unsubscribe: Unsubscriber;

$: (() => {
  if (ref) {
    instance = new ContextMenu(ref, containerRef);
    const { opened: value } = instance;

    unsubscribe = value.subscribe((isOpened) => {
      opened = isOpened;
    });
  }

})();

onDestroy(() => {
  unsubscribe();
});
</script>

<div
  class="function-junctions-context_menu"
  bind:this={ref}
>
  <slot />
</div>