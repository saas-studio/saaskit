import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@saaskit/cli': './src',
      '@saaskit/codegen': '../codegen/src',
      '@saaskit/schema': '../schema/src',
    },
  },
})
