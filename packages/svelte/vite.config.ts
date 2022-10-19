import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

import eslintPlugin from 'vite-plugin-eslint';
import sveld from 'vite-plugin-sveld';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    eslintPlugin(),
    sveld(),
  ],
  server: {
    host: true,
    port: 8001,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/library/index.ts'),
      name: 'function-junctions',
      fileName: (format) => `function-junctions.${format}.js`,
    },
  },
  resolve: {
    alias: {
      '@': resolve(resolve(), './src'),
      'core': resolve(resolve(), '../core/src/library'),
    },
  },
});
