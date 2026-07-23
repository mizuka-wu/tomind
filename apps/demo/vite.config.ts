import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@tomind/core': path.resolve(__dirname, '../../packages/core/src'),
      '@tomind/schema': path.resolve(__dirname, '../../packages/schema/src'),
      '@tomind/state': path.resolve(__dirname, '../../packages/state/src'),
      '@tomind/view': path.resolve(__dirname, '../../packages/view/src'),
      '@tomind/layout': path.resolve(__dirname, '../../packages/layout/src'),
      '@tomind/style': path.resolve(__dirname, '../../packages/style/src'),
      '@tomind/extension': path.resolve(__dirname, '../../packages/extension/src'),
      '@tomind/extensions': path.resolve(__dirname, '../../packages/extensions/src'),
      '@tomind/commands': path.resolve(__dirname, '../../packages/commands/src'),
      '@tomind/editor': path.resolve(__dirname, '../../packages/editor/src'),
      '@tomind/formats': path.resolve(__dirname, '../../packages/formats/src'),
      '@tomind/starter-vanilla': path.resolve(__dirname, '../../startkits/vanilla/src'),
    },
  },
  base: process.env.VITE_BASE ?? '/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})
