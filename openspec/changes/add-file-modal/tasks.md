# Tasks

## 1. 常量与类型

- [x] 1.1 在 `packages/element-pro/src/constant/index.ts` 追加 FileModal 常量（默认列数、每页条数、分组名称长度、默认色、自定义比例占位与文案、上传按钮文案、排序项），验证 `pnpm lint` 无告警
- [x] 1.2 新建 `packages/element-pro/src/FileModal/types.ts`，定义 `FileModalAsset`、`FileModalGroup`、`FileModalGroupPayload`、`FileModalQuery`、`FileModalRequest`、`FileModalCreateGroup`、`FileModalUpload`、`FileModalProps`、`FileModalEmits`，验证 `FileModalQuery` 用类型别名以满足 `RequestFn` 的 `Record<string, unknown>` 约束
- [x] 1.3 新建 `packages/element-pro/src/FileModal/utils.ts`，实现 `formatFileSize`、`formatFileTime`、`getAssetThumb`、`getAssetMeta`、`filterGroups`、`isAssetSelected`、`resolveNextSelected`、`pickSelectedAssets`、`resolveCropperRatios`，验证无 `any`

## 2. 裁剪器文案能力

- [x] 2.1 在 `CropperUpload/types.ts` 的 `CropperUploadProps` 与 `CropperDialogProps` 增加可选 `ratioLabels`，验证类型可被两处共用
- [x] 2.2 在 `CropperDialog.vue` 增加 `ratioLabelOf(index, ratio)`，比例按钮与尺寸提示改用该文案，验证不传 `ratioLabels` 时仍显示 `1:1` / `自由`
- [x] 2.3 在 `CropperUpload/index.vue` 透传 `ratioLabels`，验证既有 demo 输出不变

## 3. 比例配置

- [x] 3.1 `resolveCropperRatios` 把配置里的 `0` 换算成图片真实宽高比、文案缺省时按比例生成，空数组原样返回空列表
- [x] 3.2 `FileModal` 的 `cropperRatios` 默认 `[]`，表示不裁剪：选完图片直接上传原图，不打开裁剪弹窗
- [x] 3.3 `FileModalUploadButton.vue` 按 `ratios.length > 0` 判断是否启用裁剪，两条路径共用同一个上传函数
- [x] 3.4 传入比例时才打开裁剪弹窗，`cropperRatios: [9/16]` 只给出 9:16、`[9/16, 16/9]` 两者并存，验证按钮数量与文案正确
- [x] 3.5 `cropperRatioLabels` 按位置覆盖文案，缺省项回退自动生成，验证 `['竖版','横版']` 生效
- [x] 3.6 启用裁剪时用 `Image` 读取文件真实宽高比，在弹窗打开前完成比例换算，验证 `0` 换算成原图比例
- [x] 3.7 上传按钮默认文案改为「上传素材」，验证不再出现「上传图片」

## 4. 子组件

- [x] 4.1 新建 `components/FileModalAssetCard.vue`，渲染缩略图、选中角标、名称与体积/时间，验证点击与 Enter/Space 都能切换选中
- [x] 4.2 新建 `components/FileModalGroupPanel.vue`，渲染分组搜索、分组列表、色点与新建分组弹层，验证分组搜索只做本地过滤
- [x] 4.3 在 `FileModalGroupPanel.vue` 里把新建分组接到外部 promise：成功后 `emit('created')` 并关闭弹层，失败保留输入并提示，验证空名称时「确定」不可点击
- [x] 4.4 新建 `components/FileModalUploadButton.vue`，用隐藏 `<input type="file">` 完成选文件，配置了比例时再用 `CropperDialog` 裁剪，确认后调用 `upload(file, { groupId })`，验证取消与出错都能正确复位
- [x] 4.5 `utils.ts` 增加 `getAssetMediaType` / `isAssetPreviewable` / `getAssetPreviewUrl`，优先按 MIME、其次按扩展名判定 `image` / `video` / `other`
- [x] 4.6 `FileModalAssetCard.vue` 增加唯一一个预览入口按钮，仅图片/视频展示；点击阻止冒泡，不改变选中态
- [x] 4.7 `FileModal` 内置预览：图片走 `ElImageViewer`，视频走弹窗内 `<video>`，预览地址取 `previewUrl`（退回 `url`），卡片图取 `abbreviateUrl`（退回 `url`）

## 5. 主组件

- [x] 5.1 新建 `FileModal/index.vue`，用 `ElDialog` + 左分组 + 右内容区布局，`destroy-on-close` 关闭即销毁，验证重新打开会重新请求
- [x] 5.2 内嵌 `ProTable`：`modes: ['list']`、`search: false`、`options: false`、`listProps.columns` 取自 `columns`，验证网格列数可配
- [x] 5.3 用 `computed` 组装 `keyword` / `sortBy` / `groupId` 并通过 `params` 注入 ProTable，验证任一变化都回第一页并重新请求
- [x] 5.4 搜索框接 `debounce(300)`，`onBeforeUnmount` 调 `cancel()`，验证连续输入只发一次请求
- [x] 5.5 `request` 外层套 `useLockFn` 并用 `tail` 串行排队，避免并发重复调用，验证 ProTable 不会拿到 `undefined`
- [x] 5.6 排序下拉接内置三项，`handleSortChange` 收敛到 `FileModalSortValue`，验证未知值被忽略
- [x] 5.7 选中态用 `Key[]` 维护，支持受控（`v-model:selected`）与非受控，验证单选与多选语义
- [x] 5.8 `onLoad` 把素材写入 `Map<Key, T>` 缓存，`confirm` 用 `pickSelectedAssets` 按选中顺序回捞，验证跨页选择能拿到完整记录
- [x] 5.9 新建分组成功后追加到本地分组副本并切到该分组，验证不依赖父组件回写
- [x] 5.10 新建分组期间给弹窗加 loading，失败时保留输入与遮罩状态正确复位
- [x] 5.11 上传成功后把素材写入缓存、自动选中并 `reload(true)`，验证列表回到第一页
- [x] 5.12 请求中 / 新建分组中给内容区加 `v-loading`，同时隐藏关闭图标、禁用 ESC 与底部按钮，验证不可点击
- [x] 5.13 无选中项时「确定」禁用；关闭图标等同取消，验证 `cancel` 与 `confirm` 不会同时触发
- [x] 5.14 打开时清空搜索词与缓存，验证上次关键词不会把列表筛空

## 6. 注册与样式

- [x] 6.1 新建 `FileModal/index.ts`，用 `withInstall` 导出并 `export * from './types'`、`export * from './utils'`，验证类型可从包入口取到
- [x] 6.2 新建 `styles/index.scss`，class 前缀取自 `ConfigProvider` 的 `prefix`，并收敛 ProTable 在弹窗内的工具栏与外框样式，验证 `pnpm format:check` 通过
- [x] 6.3 修改 `packages/element-pro/src/index.ts`，加入 import、`export *`、具名导出与 `components` 注册数组，验证 `app.use(ElementPro)` 后 `FileModal` 全局可用

## 7. 文档与示例

- [x] 7.1 新建 `FileModal/index.md`，说明 request 契约、请求串行与 loading、默认不裁剪与比例区间、Props / Events / 类型，验证 dumi 路由为 `/element-pros/file-modal`
- [x] 7.2 新建 `FileModal/demo/basic.vue`，用本地 SVG 占位图模拟 78 条素材与分页，验证搜索、排序、分组、新建分组、上传、预览全链路可跑
- [x] 7.3 新建 `FileModal/demo/ratio.vue`，演示「不裁剪（默认）」「只允许 9:16」「9:16 + 16:9」「原图比例 + 1:1」四个场景
- [x] 7.4 在 `CropperUpload/index.md` 补充 `ratioLabels` 用法，验证文档与实现同步

## 8. 校验

- [x] 8.1 新增 `packages/element-pro/tests/file-modal.test.mjs`，覆盖选中语义、分组过滤、记录回捞、体积格式化与 `resolveCropperRatios`
- [x] 8.2 `pnpm --filter @wapri/element-pro build` 通过
- [x] 8.3 `pnpm lint` 与 `pnpm format:check` 通过
- [x] 8.4 新增 changeset（`minor`）
