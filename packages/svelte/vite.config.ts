import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), eslintPlugin()],
  server: {
    host: true,
    port: 8001,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'library/index.ts'),
      name: 'svelte',
      // the proper extensions will be added
      fileName: 'svelte'
    },
  },
  resolve: {
    alias: {
      '@': resolve(resolve(), './src'),
      'core': resolve(resolve(), '../core/src/library'),
    },
  },
});
