import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import path from 'path';

const production = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  build: {
    outDir: './build/public',
  },
  server: {
    port: 8000,
    fs: {
      allow: ['../../../../'],
    },
    host: true,
  },
  rollupDedupe: ['svelte'],
  plugins: [
    // Path is relative to './src/app' so I have to
    // navigate up to access the svelte config
    svelte({
      emitCss: !production,
      preprocess: [
        sveltePreprocess({
          typescript: {
            tsconfigFile: './tsconfig.json',
          },
        }),
      ],
      compilerOptions: {
        dev: !production,
      },
      hot: !production,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(path.resolve(), './src'),
    },
  },
});
