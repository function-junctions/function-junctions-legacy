import 'framework7-icons';
import 'framework7/css/bundle';

// @ts-expect-error
import Framework7 from 'framework7/lite-bundle';
import Framework7Svelte from 'framework7-svelte';

// https://framework7.io/svelte/init-app
Framework7.use(Framework7Svelte);

import App from '@/App.svelte';

new App({
  target: document.body,
});
