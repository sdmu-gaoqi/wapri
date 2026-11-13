# add-file-list

## Why

业务里「附件 / 凭证 / 素材」大多是一组 `{ name, abbreviateUrl, previewUrl }` 的卡片，需要支持点击预览、删除、拖动排序。目前 `FileModal` 解决的是「从素材库里选」，`CropperUpload` 解决的是「上传」，都没有一个直接渲染数据数组的展示型组件，导致每个页面都要重复写缩略图、图片查看器、视频弹窗和拖拽排序。

新增 `FileList`：只负责渲染传入的 `data`，把预览、删除、排序统一收口，业务通过 `v-model:data` 或事件接入。

## What Changes

- 新增目录 `packages/element-pro/src/FileList/`，对应 dumi 页面 `/element-pros/file-list`。
- 数据类型 `FileListItem`：`{ name: string; abbreviateUrl: string; previewUrl: string; [key: string]: unknown }`，支持业务通过索引签名带额外字段。
- 卡片网格：CSS Grid，`columns` 控制每行列数（默认 4），缩略图 1:1 裁切，名称单行省略；hover 显示预览 / 删除，触屏设备常驻显示；缩略图加载失败降级为文件图标。
- 预览按媒体类型分流：
  - 图片：`ElImageViewer`，`urlList` 只包含图片项（自动过滤视频 / 文档），`initialIndex` 对齐当前图片，支持左右切换。
  - 视频：`ElDialog` + `<video controls autoplay>`。
  - 其他（PDF / Word / XLSX / 文本）：`ElDialog` + 容器，动态 `import('@wapri/preview')` 后调用 `previewFile`，关闭时 `destroy()`。
- 拖动排序：复用 `@vue-dnd-kit/core`（`makeSortableList` 网格策略 + 私有 `DnDProvider`），拖出列表取消。
- 数据回写：内部维护副本，删除 / 排序后同时 `emit('update:data')` 与 `remove` / `sort` 事件。
- 媒体类型判断抽到 `src/shared/media/`，`FileModal` 现有 `getAssetMediaType` 改为复用，保证两处行为一致。
- `element-pro` 增加 `@wapri/preview` 依赖；`vite.config.ts` 将其 external，只有打开「其他类型」预览时才动态加载。
- 导出 / 注册 `FileList`，补常量、样式、dumi 文档、demo 与 changeset（`minor`）。

## Capabilities

### New Capabilities

- `file-list`：数据驱动的文件卡片列表，支持图片 / 视频 / 文档预览、删除和拖动排序。

### Modified Capabilities

- `file-modal`：媒体类型判断改为复用 `shared/media`，对外行为不变。

## Impact

- Affected specs: `file-list`（新增）；`file-modal`（内部实现复用，无行为变更）
- Affected code:
  - 新增 `packages/element-pro/src/FileList/**`
  - 新增 `packages/element-pro/src/shared/media/index.ts`
  - 修改 `packages/element-pro/src/FileModal/utils.ts`
  - 修改 `packages/element-pro/src/constant/index.ts`
  - 修改 `packages/element-pro/src/index.ts`
  - 修改 `packages/element-pro/{package.json,vite.config.ts}`
  - 新增 `.changeset/file-list.md`
- 依赖：`element-pro` 新增 `@wapri/preview`（workspace 内部包）；拖拽仍要求 `vue >= 3.5`，未使用 `sortable` 或 `Vue 3.3 / 3.4` 项目不受影响。
- 已知限制：
  - 图片预览只在图片项之间切换，视频 / 文档不参与左右滑动。
  - 文档预览依赖 `@wapri/preview`，PDF 的 worker、XLSX 的 vendor 路径需按 preview 文档配置。
  - 排序只在当前列表内有效，不做跨列表拖拽。
