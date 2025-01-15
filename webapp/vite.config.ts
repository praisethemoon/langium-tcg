import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin],
    },
  },
  server: {
    fs: {
      // Must allow parent dir to be accessible, since we depend on card-webview
      allow: [
        path.resolve(__dirname, '../'),
        path.resolve(__dirname, './src'),
        path.resolve(__dirname, './node_modules'),
      ],
    },
  },
});
