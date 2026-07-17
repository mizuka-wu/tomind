import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@tomind/schema': path.resolve(__dirname, 'packages/schema/src'),
      '@tomind/state': path.resolve(__dirname, 'packages/state/src'),
      '@tomind/view': path.resolve(__dirname, 'packages/view/src'),
      '@tomind/layout': path.resolve(__dirname, 'packages/layout/src'),
      '@tomind/style': path.resolve(__dirname, 'packages/style/src'),
      '@tomind/extension': path.resolve(__dirname, 'packages/extension/src'),
      '@tomind/assets': path.resolve(__dirname, 'packages/assets/src'),
      '@tomind/plugins': path.resolve(__dirname, 'packages/plugins/src'),
      '@tomind/commands': path.resolve(__dirname, 'packages/commands/src'),
      '@tomind/xap': path.resolve(__dirname, 'packages/xap/src'),
      '@tomind/editor': path.resolve(__dirname, 'packages/editor/src'),
      '@tomind/core': path.resolve(__dirname, 'packages/core/src'),
      '@tomind/extensions': path.resolve(__dirname, 'packages/extensions/src'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/**/*.pw.test.ts'],
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    testTimeout: 30000,
  },
})
