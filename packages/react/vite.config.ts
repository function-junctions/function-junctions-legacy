import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslintPlugin(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  server: {
    host: true,
    port: 8002,
  },
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/library/index.ts'),
      name: 'function-junctions',
      fileName: (format) => `function-junctions.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: [
          '@import "../core/src/library/index.scss";',
          '',
        ].join('\n'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(resolve(), './src'),
      '@core': resolve(resolve(), '../core/src/library'),
    },
  },
});
