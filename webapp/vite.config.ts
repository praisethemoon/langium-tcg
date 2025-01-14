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
      // Add external directories while ensuring 'node_modules' is not restricted
      allow: [
        path.resolve(__dirname, '../'), // Your external directory
        path.resolve(__dirname, './src'),    // Project's src
        path.resolve(__dirname, './node_modules'), // Ensure node_modules is accessible
      ],
    },
  },
});
