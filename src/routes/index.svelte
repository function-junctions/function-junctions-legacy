<style global>
  @import 'framework7/css/bundle';
  @import 'framework7-icons';
</style>

<script lang="ts">
  import type { SvelteComponentDev } from 'svelte/internal';

  // @ts-expect-error
  import Framework7 from 'framework7/lite-bundle';
  import Framework7Svelte from 'framework7-svelte';
  import { onMount } from 'svelte';

  let App: typeof SvelteComponentDev;

  // https://framework7.io/svelte/init-app
  
  onMount(async () => {
    Framework7.use(Framework7Svelte);
    App = (await import('../kitchen-sink/App.svelte')).default;
  })
</script>

<svelte:head>
  <title>Kitchen-Sink</title>
</svelte:head>

<svelte:component this={App} />