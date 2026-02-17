import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          'radix-ui': [
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-separator',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-slider',
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
