# Design

## 组件边界

`FileList` 是展示型组件，不负责上传、不查询数据、不做业务持久化：

- 输入：`data`（受控，可 `v-model:data`）
- 输出：`update:data` / `remove` / `sort` / `preview` / `error`
- 预览：图片、视频内置；其他类型交给 `@wapri/preview`

`FileModal` 是「选择素材」的弹窗，`CropperUpload` 是「上传」入口，三者不互相依赖。

## 媒体类型判断

现有 `FileModal/utils.ts` 的 `getAssetMediaType` 已经覆盖 MIME 字段与扩展名两层判断。把它抽到 `src/shared/media/index.ts`：

```ts
export type FileMediaType = 'image' | 'video' | 'other'

export interface FileMediaSource {
  name?: string
  url?: string
  previewUrl?: string
  abbreviateUrl?: string
  [key: string]: unknown
}

export const getFileMediaType = (source: FileMediaSource): FileMediaType
```

- `FileList` 直接使用 `getFileMediaType(item)`。
- `FileModal/utils.ts` 的 `getAssetMediaType` 改为调用 `getFileMediaType`，保持导出不变。

## 预览实现

组件内部维护一个 `previewState`：

```ts
type PreviewState =
  | { kind: 'none' }
  | { kind: 'image'; index: number }
  | { kind: 'video'; src: string; title: string }
  | { kind: 'other'; src: string; title: string }
```

- 图片：计算 `imageItems`（只含 `image` 类型），`urlList` 取 `previewUrl || abbreviateUrl`；`previewState.index` 是图片数组中的下标。
- 视频：`ElDialog` + `<video>`，关闭即销毁 DOM，避免后台继续播放。
- 其他：`ElDialog` + 空容器，打开后 `nextTick` 动态 `import('@wapri/preview')`。用递增 `requestId` 防止「加载完成时用户已经关闭 / 切换到另一个文件」；关闭、卸载、切换时对旧句柄 `destroy()`。
- 预览失败：`ElAlert` 展示错误文案，并 `emit('error', error)`。

动态导入的原因：`@wapri/preview` 依赖 pdfjs / mammoth / xlsx，体积大，不能让所有使用 `FileList` 的业务都吃进首屏包体。`element-pro` 的 vite 构建把它加入 `external`，产物保留 `import('@wapri/preview')`，由消费方打包器按需拆分。

## 拖拽排序

复用 `CropperUpload` / `DragSortTable` 已验证的模式：

- `index.vue` 用 `DnDProvider` 包住网格（仅 `sortable` 时）。
- 网格容器通过 `makeSortableList` 注册，`strategy: 'grid'`，`items` 指向内部 `shallowRef`，`getKey` 优先取 `item.id`，否则用索引 + 名称。
- 每个卡片通过 `SortableItemRegistrar` 注册 DOM（`target` 返回卡片根元素）。
- `onDrop` 中 `event.result.get(id)` 得到新顺序，`event.preventDefault()` 后自行回写并 emit。
- `dropOutside: 'cancel'`：拖出列表恢复原顺序。
- 默认 `activation` 保留库的鼠标 4px / 触摸 200ms，避免点击预览被误判为拖动。

## 样式

- 根元素 `display: grid`，`grid-template-columns: repeat(var(--wa-ui-file-list-columns), minmax(0, 1fr))`，`--columns` 由 `columns` prop 通过内联动态变量注入（属于动态计算，允许内联）。
- 缩略图 `aspect-ratio: 1 / 1`、`object-fit: cover`。
- 操作按钮默认 `opacity: 0`，hover / focus-within 显示；`@media (hover: none)` 常驻显示。
- 拖拽占位、拖拽中卡片由 `@vue-dnd-kit/core` 写入的 `data-dnd-placeholder` / `data-dnd-dragging` 属性控制。
- 所有 class 使用 `ConfigProvider` 的 `prefix`。

## 兼容性

- 图片 / 视频 / 文档预览在 Vue 3.3 可用。
- 拖拽依赖 `vue >= 3.5`，与 `DragSortTable`、`CropperUpload` 的 `sortable` 一致；不使用 `sortable` 时不会触发。
