import { defineConfig } from 'father'

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  esm: {
    output: 'dist',
    // demo 只给 dumi 文档站用，不进 npm 产物
    ignores: ['**/demo/**'],
  },
  extraBabelPlugins: [['transform-remove-console', { exclude: ['error', 'warn', 'info', 'debug'] }]],
})
