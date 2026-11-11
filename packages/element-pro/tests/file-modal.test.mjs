import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

/** `dayjs` 由 `@wapri/gbase` 引入，测试里从同一处解析，避免额外依赖。 */
const dayjsPath = createRequire(new URL('../../@base/package.json', import.meta.url)).resolve('dayjs')

/**
 * `@wapri/gutils` 从 workspace 源码导出，测试里只替换成本文件用到的两个出口，
 * 其余能力由真实实现提供会拉起整条依赖链，没必要。
 */
const gutilsStubSource = `
export { default as dayjs } from 'dayjs'
/** 与 packages/@base/src/fileType.ts 的实现保持一致 */
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

const utils = await buildEntry('../src/FileModal/utils.ts')

test('formatFileSize 按 1024 进制换算并保留一位小数', () => {
  assert.equal(utils.formatFileSize(0), '0 B')
  assert.equal(utils.formatFileSize(512), '512 B')
  assert.equal(utils.formatFileSize(1024), '1 KB')
  assert.equal(utils.formatFileSize(349.8 * 1024), '349.8 KB')
  assert.equal(utils.formatFileSize(1024 * 1024 * 3), '3 MB')
})

test('formatFileSize 对非法值返回空串', () => {
  assert.equal(utils.formatFileSize(undefined), '')
  assert.equal(utils.formatFileSize(-1), '')
  assert.equal(utils.formatFileSize(Number.NaN), '')
})

test('formatFileTime 默认输出到分钟，非法值返回空串', () => {
  assert.equal(utils.formatFileTime('2026-11-10T10:07:23+08:00'), '2026-11-10 10:07')
  assert.equal(utils.formatFileTime(undefined), '')
  assert.equal(utils.formatFileTime('not-a-date'), '')
})

test('getAssetThumb 图片与视频统一取 abbreviateUrl', () => {
  const asset = { id: 'a', name: 'a.mp4', url: 'https://cdn/a.mp4', abbreviateUrl: 'https://cdn/a-poster.jpg' }
  assert.equal(utils.getAssetThumb(asset), 'https://cdn/a-poster.jpg')
  assert.equal(utils.getAssetThumb({ ...asset, abbreviateUrl: undefined }), 'https://cdn/a.mp4')
  assert.equal(utils.getAssetThumb({ ...asset, abbreviateUrl: '' }), 'https://cdn/a.mp4')
})

test('getAssetPreviewUrl 点击预览优先取 previewUrl', () => {
  const asset = { id: 'a', name: 'a.mp4', url: 'https://cdn/a.mp4', previewUrl: 'https://cdn/a-hd.mp4' }
  assert.equal(utils.getAssetPreviewUrl(asset), 'https://cdn/a-hd.mp4')
  assert.equal(utils.getAssetPreviewUrl({ ...asset, previewUrl: undefined }), 'https://cdn/a.mp4')
  assert.equal(utils.getAssetPreviewUrl({ ...asset, previewUrl: '' }), 'https://cdn/a.mp4')
})

test('getAssetMeta 只拼接存在的项', () => {
  assert.equal(utils.getAssetMeta({ id: 'a', name: 'a.png', url: 'u' }), '')
  assert.equal(utils.getAssetMeta({ id: 'a', name: 'a.png', url: 'u', size: 1024 }), '1 KB')
  assert.equal(
    utils.getAssetMeta({ id: 'a', name: 'a.png', url: 'u', size: 2048, createdAt: '2026-11-10T10:07:23+08:00' }),
    '2 KB · 2026-11-10 10:07',
  )
})

test('filterGroups 按名称做本地不区分大小写过滤', () => {
  const groups = [
    { id: 'g-1', name: '商品主图' },
    { id: 'g-2', name: 'Detail Shots' },
  ]
  assert.deepEqual(utils.filterGroups(groups, ''), groups)
  assert.deepEqual(utils.filterGroups(groups, '   '), groups)
  assert.deepEqual(
    utils.filterGroups(groups, '主图').map((item) => item.id),
    ['g-1'],
  )
  assert.deepEqual(
    utils.filterGroups(groups, 'DETAIL').map((item) => item.id),
    ['g-2'],
  )
  assert.deepEqual(utils.filterGroups(groups, '不存在'), [])
})

test('resolveNextSelected 单选时替换、多选时切换', () => {
  assert.deepEqual(utils.resolveNextSelected([], 'a', false), ['a'])
  assert.deepEqual(utils.resolveNextSelected(['a'], 'b', false), ['b'])
  assert.deepEqual(utils.resolveNextSelected(['a'], 'a', false), [])

  assert.deepEqual(utils.resolveNextSelected([], 'a', true), ['a'])
  assert.deepEqual(utils.resolveNextSelected(['a'], 'b', true), ['a', 'b'])
  assert.deepEqual(utils.resolveNextSelected(['a', 'b'], 'a', true), ['b'])
})

test('isAssetSelected 按 id 判断选中态', () => {
  assert.equal(utils.isAssetSelected(['a', 'b'], 'a'), true)
  assert.equal(utils.isAssetSelected(['a', 'b'], 'c'), false)
})

test('pickSelectedAssets 按选中顺序回捞记录并跳过缺失项', () => {
  const cache = new Map([
    ['a', { id: 'a', name: 'A.png', url: 'u-a' }],
    ['b', { id: 'b', name: 'B.png', url: 'u-b' }],
  ])
  assert.deepEqual(
    utils.pickSelectedAssets(cache, ['b', 'a']).map((asset) => asset.id),
    ['b', 'a'],
  )
  assert.deepEqual(
    utils.pickSelectedAssets(cache, ['a', 'missing', 'b']).map((asset) => asset.id),
    ['a', 'b'],
  )
  assert.deepEqual(utils.pickSelectedAssets(cache, []), [])
})

test('resolveCropperRatios 把自定义比例换成图片自身宽高比', () => {
  const resolved = utils.resolveCropperRatios([0], [], 4 / 3)
  assert.deepEqual(resolved.ratios, [4 / 3])
  assert.deepEqual(resolved.labels, ['自定义'])
})

test('resolveCropperRatios 空配置表示不裁剪', () => {
  const resolved = utils.resolveCropperRatios([], [], 0.75)
  assert.deepEqual(resolved.ratios, [])
  assert.deepEqual(resolved.labels, [])
})

test('resolveCropperRatios 保留固定比例并支持自定义文案', () => {
  const resolved = utils.resolveCropperRatios([0, 9 / 16, 16 / 9], ['原图', '竖版'], 2)
  assert.deepEqual(resolved.ratios, [2, 9 / 16, 16 / 9])
  assert.deepEqual(resolved.labels, ['自定义', '竖版', '16:9'])
})

test('resolveCropperRatios 只允许固定比例时不出现自定义', () => {
  const resolved = utils.resolveCropperRatios([9 / 16], [], 1.5)
  assert.deepEqual(resolved.ratios, [9 / 16])
  assert.deepEqual(resolved.labels, ['9:16'])
})

test('getAssetMediaType 优先按 MIME 判断', () => {
  assert.equal(utils.getAssetMediaType({ id: 'a', name: 'a', url: 'u', type: 'image/png' }), 'image')
  assert.equal(utils.getAssetMediaType({ id: 'a', name: 'a', url: 'u', type: 'video/mp4' }), 'video')
  assert.equal(utils.getAssetMediaType({ id: 'a', name: 'a', url: 'u', type: 'application/pdf' }), 'other')
})

test('getAssetMediaType 无 MIME 时按扩展名兜底', () => {
  assert.equal(utils.getAssetMediaType({ id: 'a', name: 'a', url: 'https://cdn/a.webp' }), 'image')
  assert.equal(utils.getAssetMediaType({ id: 'a', name: 'a', url: 'https://cdn/a.MOV?x=1' }), 'video')
  assert.equal(utils.getAssetMediaType({ id: 'a', name: 'a.png', url: 'https://cdn/file' }), 'image')
  assert.equal(utils.getAssetMediaType({ id: 'a', name: 'a.docx', url: 'https://cdn/file' }), 'other')
})

test('isAssetPreviewable 只对图片与视频为真', () => {
  assert.equal(utils.isAssetPreviewable({ id: 'a', name: 'a.png', url: 'u' }), true)
  assert.equal(utils.isAssetPreviewable({ id: 'a', name: 'a.mp4', url: 'u' }), true)
  assert.equal(utils.isAssetPreviewable({ id: 'a', name: 'a.pdf', url: 'u' }), false)
})
