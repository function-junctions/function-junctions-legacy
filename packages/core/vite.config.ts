import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslintPlugin(),
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
    },
  },
  resolve: {
    alias: {
      '@': resolve(resolve(), './src'),
    },
  },
});
