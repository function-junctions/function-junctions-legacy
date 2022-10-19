import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import { resolve } from 'path';

import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslintPlugin(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  server: {
    host: true,
    port: 8000,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/library/index.ts'),
      name: 'function-junctions',
      fileName: (format) => `function-junctions.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        sourcemapExcludeSources: true,
      },
    },
    sourcemap: true,
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': resolve(resolve(), './src'),
    },
  },
});
