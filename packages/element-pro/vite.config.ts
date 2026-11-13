import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDir: 'dist',
      entryRoot: 'src',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/**/demo/**'],
    }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'wa-ui',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        'element-plus',
        // ElUpload 未暴露内部上传方法，复用其默认 xhr 实现
        'element-plus/es/components/upload/src/ajax',
        '@element-plus/icons-vue',
        '@wapri/ghooks',
        '@wapri/gutils',
        // 文档 / PDF / Word / XLSX 预览体积较大，按需动态加载
        '@wapri/preview',
        // 拖拽排序底座：作为运行时依赖，交给使用方安装，不打进包体
        '@vue-dnd-kit/core',
        'classnames',
        'vue-cropper',
      ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
