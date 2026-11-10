# add-file-modal

## Why

中后台里「选素材」是高频需求：商品图片、详情图、活动 banner 都要从素材库挑，业务现在每接一个地方就要重写一遍弹窗——左侧分组、右侧网格、搜索、排序、分页、新建分组、上传裁剪，六七摊状态，且每个项目实现出的交互都不一样。

仓库已有 `ProTable`（列表模式 + 请求生命周期 + 分页）与 `CropperUpload`（裁剪 + 比例 + 实时预览），素材选择的骨架其实已经齐了，缺的只是一个把它们组装成「选择器」的封装。

本变更交付 `FileModal`：对外只暴露 `request` 与 `columns`，列表能力完全复用 ProTable，分组与上传作为可选能力注入。

## What Changes

- 新增目录 `packages/element-pro/src/FileModal/`，对应 dumi 文档页 `/element-pros/file-modal`。
- `request` **直接复用 ProTable 的 `RequestFn` 签名**（`(params, sort, filter, context) => Promise<RequestResult>`），不做二次包装；`params` 在 `current`、`pageSize` 之外追加 `keyword`、`sortBy`、`groupId` 三个业务字段。
- `columns` 控制一行几列，透传给 ProTable 的 `listProps.columns`；素材卡片通过 `itemRender` 插槽渲染。
- 内置搜索框（300ms 防抖）与排序下拉（最新上传 / 名称 A-Z / 文件从大到小），不改 ProTable 的查询表单。
- 请求串行化：`useLockFn` + 队列，搜索连续变化时不并发重复调用；请求与新建分组期间弹窗加 loading 遮罩并禁止点击。
- 左侧分组面板：本地搜索、色点、新建分组弹层。新建分组走外部 `createGroup` promise，返回的记录插入分组列表并**自动切换到该分组**。
- 上传：内置裁剪并且**默认只提供「自定义」**——按图片自身宽高等比裁剪，不做任何变形。`cropperRatios` 用来限制可选比例区间（如只允许 9:16，或 9:16 与 16:9 并存），`0` 代表「自定义」这一项。裁剪结果交给外部 `upload(file, { groupId })`，返回的素材**自动选中**并刷新回第一页。
- 弹窗 `destroy-on-close`：关闭即销毁内部内容，下次打开重新请求。
- 选中态由组件自己维护（ProTable 列表模式没有行选择），确认时回传**完整素材记录**而非 id，跨页选择靠内部 id 缓存兜底。
- `CropperUpload` 新增 `ratioLabels`：让比例按钮文案可覆盖，向后兼容（不传时维持 `formatRatio` 的自动文案）。
- `constant/index.ts` 新增 FileModal 相关常量（默认列数、每页条数、分组名称长度、默认色、自定义比例占位与文案、上传按钮文案、排序项）。
- `packages/element-pro/src/index.ts` 注册并导出 `FileModal` 与全部类型。
- 新增 dumi 文档页与两个可运行 demo；新增 changeset（`minor`）。

## Capabilities

### New Capabilities

- `file-modal`: 素材选择弹窗的分组、搜索、排序、分页、新建分组、裁剪上传与选中回传行为。

### Modified Capabilities

- `cropper-upload`: 比例按钮文案可覆盖（`ratioLabels`）。既有 `ratios`、`aspectRatio` 行为不变。

## Impact

- Affected specs: `file-modal`（新增能力）、`cropper-upload`（追加 `ratioLabels`）
- Affected code:
  - `packages/element-pro/src/FileModal/**`（新增）
  - `packages/element-pro/src/constant/index.ts`
  - `packages/element-pro/src/CropperUpload/types.ts`
  - `packages/element-pro/src/CropperUpload/CropperDialog.vue`
  - `packages/element-pro/src/CropperUpload/index.vue`
  - `packages/element-pro/src/CropperUpload/index.md`
  - `packages/element-pro/src/index.ts`
  - `packages/element-pro/tests/file-modal.test.mjs`（新增）
