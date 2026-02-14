import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    manifest: true,
    outDir: 'dist',
    emptyOutDir: true,
  },

  server: {
    host: '127.0.0.1', // IMPORTANT
    port: 5173,
    strictPort: true,
  },
})