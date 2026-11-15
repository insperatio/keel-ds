// A tiny second app, so the comparison pages build and run exactly like real pages without
// living in src/ — where the audit would (rightly) fail the no-design-system one in CI.
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '../src') } },
  build: {
    outDir: path.resolve(import.meta.dirname, '../experiments-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        without: path.resolve(import.meta.dirname, 'without.html'),
        with: path.resolve(import.meta.dirname, 'with.html'),
      },
    },
  },
})
