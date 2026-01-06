import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@saaskit/codegen': './src',
      '@saaskit/core': '../core/src',
      '@saaskit/schema': '../schema/src',
    },
  },
})
