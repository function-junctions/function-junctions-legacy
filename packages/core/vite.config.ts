import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [eslintPlugin()],
  server: {
    host: true,
    port: 8000,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'library/index.ts'),
      name: 'core',
      // the proper extensions will be added
      fileName: 'core'
    },
  },
  resolve: {
    alias: {
      '@': resolve(resolve(), './src'),
    },
  },
});
