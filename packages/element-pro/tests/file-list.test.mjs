import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

/** `dayjs` 由 `@wapri/gbase` 引入，测试里从同一处解析，避免额外依赖。 */
const dayjsPath = createRequire(new URL('../../@base/package.json', import.meta.url)).resolve('dayjs')

/** `@wapri/gutils` 只替换本文件用到的扩展名解析，避免拉起整条依赖链。 */
const gutilsStubSource = `
export { default as dayjs } from 'dayjs'
export const getFileExtension = (nameOrUrl = '') => {
  const clean = nameOrUrl.split(/[?#]/)[0].split('/').pop() ?? ''
  const dot = clean.lastIndexOf('.')
  return dot > 0 ? clean.slice(dot + 1).toLowerCase() : ''
}
`

const gutilsStub = {
  name: 'gutils-stub',
  enforce: 'pre',
  resolveId(id) {
    if (id === '@wapri/gutils') return '\0gutils-stub'
    return null
  },
  load(id) {
    if (id === '\0gutils-stub') return gutilsStubSource
    return null
  },
}

const buildEntry = async (relativePath) => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [gutilsStub],
    build: {
      write: false,
      minify: false,
      lib: { entry: fileURLToPath(new URL(relativePath, import.meta.url)), formats: ['es'] },
      rollupOptions: {
        external: ['dayjs'],
        output: {
          paths: (id) => (id === 'dayjs' ? pathToFileURL(dayjsPath).href : id),
        },
      },
    },
  })
  const chunk = result[0].output.find((item) => item.type === 'chunk')
  return import(`data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`)
}

const utils = await buildEntry('../src/FileList/utils.ts')
const media = await buildEntry('../src/shared/media/index.ts')

test('getItemVideoSrc 取预览地址并补首帧锚点', () => {
  const item = { name: 'a.mp4', abbreviateUrl: 'https://cdn/a-poster.jpg', previewUrl: 'https://cdn/a.mp4' }
  assert.equal(utils.getItemVideoSrc(item), 'https://cdn/a.mp4#t=0.1')
  assert.equal(utils.getItemVideoSrc({ ...item, previewUrl: 'https://cdn/a.mp4#t=0.1' }), 'https://cdn/a.mp4#t=0.1')
})

test('getItemVideoSrc 缺少 previewUrl 时退回 abbreviateUrl', () => {
  const item = { name: 'a.mp4', abbreviateUrl: 'https://cdn/a.mp4', previewUrl: '' }
  assert.equal(utils.getItemVideoSrc(item), 'https://cdn/a.mp4#t=0.1')
})

test('getItemVideoPoster 只在封面与视频地址不同时返回', () => {
  const item = { name: 'a.mp4', abbreviateUrl: 'https://cdn/a-poster.jpg', previewUrl: 'https://cdn/a.mp4' }
  assert.equal(utils.getItemVideoPoster(item), 'https://cdn/a-poster.jpg')
  assert.equal(utils.getItemVideoPoster({ ...item, abbreviateUrl: 'https://cdn/a.mp4' }), undefined)
  assert.equal(utils.getItemVideoPoster({ ...item, abbreviateUrl: '' }), undefined)
})

test('isVideoItem 按 MIME 与扩展名判断', () => {
  assert.equal(utils.isVideoItem({ name: 'a.mp4', abbreviateUrl: '', previewUrl: '' }), true)
  assert.equal(utils.isVideoItem({ name: 'a.pdf', abbreviateUrl: '', previewUrl: '' }), false)
  assert.equal(utils.isVideoItem({ name: 'a', abbreviateUrl: '', previewUrl: '', mimeType: 'video/mp4' }), true)
})

test('getItemThumb 只有图片缺失缩略图时才退回 previewUrl', () => {
  assert.equal(utils.getItemThumb({ name: 'a.png', previewUrl: '/a.png' }), '/a.png')
  assert.equal(utils.getItemThumb({ name: 'a.pdf', previewUrl: '/a.pdf' }), '')
  assert.equal(
    utils.getItemThumb({ name: 'a.pdf', abbreviateUrl: '/a-thumb.png', previewUrl: '/a.pdf' }),
    '/a-thumb.png',
  )
})

test('getFileIconInfo 按扩展名区分文档类型与短文案', () => {
  assert.deepEqual(media.getFileIconInfo({ name: '合同.pdf' }), { type: 'pdf', label: 'PDF' })
  assert.deepEqual(media.getFileIconInfo({ name: '报价单.xlsx' }), { type: 'xlsx', label: 'XLSX' })
  assert.deepEqual(media.getFileIconInfo({ name: '简历.docx' }), { type: 'word', label: 'DOCX' })
  assert.deepEqual(media.getFileIconInfo({ name: '方案.pptx' }), { type: 'ppt', label: 'PPTX' })
})

test('getFileIconInfo 扩展名缺失时看 MIME 与媒体类型', () => {
  assert.deepEqual(media.getFileIconInfo({ name: '合同', mimeType: 'application/pdf' }), { type: 'pdf', label: 'PDF' })
  assert.deepEqual(media.getFileIconInfo({ name: '报价单', type: 'application/vnd.ms-excel' }), {
    type: 'xlsx',
    label: 'XLS',
  })
  assert.deepEqual(media.getFileIconInfo({ name: 'a.png', previewUrl: '/a.png' }), { type: 'image', label: 'PNG' })
  assert.deepEqual(media.getFileIconInfo({ name: '未知文件' }), { type: 'other', label: 'FILE' })
})

test('getFileIconInfo 名称里的版本号不会被当成扩展名', () => {
  assert.deepEqual(media.getFileIconInfo({ name: '方案 v1.2', previewUrl: '/files/a.pdf' }), {
    type: 'pdf',
    label: 'PDF',
  })
})
