import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslintPlugin()],
  server: {
    host: true,
    port: 8002,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'library/index.ts'),
      name: 'react',
      // the proper extensions will be added
      fileName: 'react'
    },
  },
  resolve: {
    alias: {
      '@': resolve(resolve(), './src'),
      'core': resolve(resolve(), '../core/src/library'),
    },
  },
});
