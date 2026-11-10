# Design

## Context

`element-pro` 里已经有两块能直接复用的能力：

- `ProTable` 的列表模式（`modes: ['list']`）已经处理了请求生命周期、分页、加载态、空状态，`itemRender` 插槽负责渲染每一项。
- `CropperUpload` 的 `CropperDialog` 是一个纯受控组件（`visible` / `file` / `confirm` / `cancel`），裁剪、比例切换、右侧实时预览都已经实现。

素材选择弹窗缺的是「把两者组装成选择器」的那一层，以及分组、搜索、排序、上传这些选择器特有的交互。

## Goals / Non-Goals

**Goals**

- `request` 与 ProTable 完全同签名，调用方不需要学第二套数据约定。
- 新建分组、上传都通过外部 promise 注入，组件不持有时序与存储副作用。
- 未传入 `createGroup` / `upload` 时相关入口自动隐藏，同一个组件既能当只读挑选器、也能当素材管理入口。

**Non-Goals**

- 不做素材删除、重命名、移动分组：这些是素材管理页的职责，选择器不需要。
- 不做分组分页与分组树：分组数据由调用方一次性传入，搜索在本地完成。
- 不做断点续传、多文件批量上传：`upload` 是单文件语义的 promise，批量由调用方在上层编排。
- 不改 `ProTable` 的行选择：列表模式本身不渲染选择列，选中态由 FileModal 自己维护。

## Decisions

### 1. `request` 直接透传 ProTable 的 `RequestFn`

不做「简化版 request」的二次包装。业务侧只要已经有 ProTable 的 `request`，把同一个函数传给 FileModal 就能用。

业务字段通过 ProTable 的 `params` 通道注入，而不是塞进 `request` 的包装层：

```ts
const queryParams = computed<FileModalQuery>(() => ({
  keyword: keyword.value || undefined,
  sortBy: sortBy.value,
  groupId: activeGroupId.value,
}))
```

`useProTableData` 已经 `watch(props.params, …)` 并 `reload(true)`，所以「关键词 / 排序 / 分组任一变化 → 回第一页并重新请求」不需要 FileModal 自己写请求逻辑。

**取舍**：`params` 走 deep watch，传一个 `undefined` 字段不会触发额外请求（`computed` 的依赖没变就不会重算），因此不需要手动判空。

### 2. 不用 ProTable 的 `search` 表单

ProTable 的搜索表单会渲染 `ElForm` + 查询/重置按钮，形态是「表格式筛选」。素材选择器要的是「一个搜索框 + 一个排序下拉」的工具条，塞进弹窗里过重，而且多一行按钮会挤压网格高度。

因此 `:search="false"`，工具条由 FileModal 自己在 ProTable 外渲染，状态通过 `params` 回灌。

### 3. 选中态由 FileModal 维护

ProTable 的 `rowSelection` 只在 table 模式生效（选择列是 `ElTableColumn type="selection"`），列表模式的选中回放逻辑里还有 `if (mode !== 'table') return`。所以在列表模式下拿不到行选择能力。

FileModal 自己维护 `Key[]`：

- `resolveNextSelected(selected, id, multiple)` 统一单选/多选语义；
- 卡片组件只负责展示 `active` 与触发 `toggle`。

### 4. 确认时回传完整记录，靠 id 缓存兜底

`v-model:selected` 收的是 id 数组（跨页也稳定），但 `confirm` 需要完整素材对象。

跨页选择时，选中的素材可能已经不在当前页的数据里，所以组件维护一个 `Map<Key, T>`，在 `onLoad` 里把加载过的素材存进去，确认时按 `selected` 的顺序回捞。

**已知限制**：调用方通过 `v-model:selected` 预置、但从未被加载过的 id 无法还原成记录，会被跳过。要避免这个限制，调用方可以在打开弹窗时把目标分组定位到这些素材所在位置。

### 5. 上传走 CropperDialog 而不是 CropperUpload

`CropperUpload` 是 `ElUpload` 的壳，自带 `fileList`、`beforeUpload` 链路。FileModal 只想要「拿到裁剪后的 File」这一个结果，套 `ElUpload` 反而要处理它的列表语义（`auto-upload=false` + `before-upload` 返回 `false` 的绕法）。

因此 FileModal 直接组合 `CropperDialog`：隐藏的 `<input type="file">` 负责选文件，`CropperDialog` 负责裁剪，确认后直接把 `File` 交给外部 `upload`。

**取舍**：`CropperDialog` 目前不是对外导出，FileModal 用相对路径引用同包内的组件，`CropperUpload` 的行为完全不变。

### 6. 「自定义」= 图片自身比例，比例区间由 `cropperRatios` 定义

裁剪器原本只有「固定比例」与「自由拖拽」两种模式，`0` 表示自由。素材上传要的不是自由拖拽，而是「按这张图自己的宽高等比裁」——不允许变形，也不强加任何固定比例。

因此 FileModal 在比例配置里用 `0` 表示「自定义」，并在**打开裁剪弹窗前**把 `0` 换成该图片真实的 `naturalWidth / naturalHeight`：

```ts
const imageRatio = await readImageRatio(file)
const { ratios, labels } = resolveCropperRatios(props.cropperRatios, props.cropperRatioLabels, imageRatio)
```

这样裁剪器拿到的永远是具体比例，`CropperDialog` 的行为完全不用改。

**默认值**是 `cropperRatios: [0]`——只提供「自定义」，且 `aspectRatio` 取第一项，天然实现「默认按图片原比例裁剪」。

**比例区间**就是数组本身：只允许 9:16 传 `[9 / 16]`（此时连「自定义」都不会出现），允许 9:16 与 16:9 传 `[9 / 16, 16 / 9]`，想保留自定义就显式写 `0`。

**取舍**：转换必须发生在弹窗打开之前。`CropperDialog` 只在 `visible` 与 `ratioIndex` 变化时重建裁剪框，弹窗打开期间改 `ratios` 不会重新生成裁剪框。放在打开前算，正好绕开这个限制。

### 7. 请求串行 + 锁

搜索变化会连续触发 `params` 更新，ProTable 的 `watch` 是「变就更」，没有防抖也没有并发控制。

两层保护：

1. 搜索输入 `debounce(300)`，把「输入值」与「生效关键词」分开；
2. `request` 外面套 `useLockFn`（来自 `@wapri/ghooks`），并用一个 `tail` promise 把调用串起来。

```ts
const lockedRequest = useLockFn(props.request)
let tail = Promise.resolve()
const request = (params, sort, filter, context) => {
  const task = tail.then(() => lockedRequest(params, sort, filter, context))
  tail = task.catch(() => undefined)
  return task
}
```

**为什么不是直接丢调用**：`useLockFn` 被锁时返回 `undefined`，ProTable 的 `load()` 里 `result.success` 会直接抛错。所以这里用「排队」而不是「丢弃」——既不并发，也不会让任何一次调用拿不到结果。真正的取舍由 ProTable 内部的 `requestId` 决定（只有最后一次的结果会落到表格上）。

### 8. 弹窗级 loading 与禁止点击

请求中或新建分组中，弹窗内容区用 `v-loading` 遮住，同时：

- `show-close` 置 `false`，右上角关闭图标消失；
- `close-on-press-escape` 置 `false`，ESC 不关闭；
- 底部两个按钮 `disabled`；
- `handleVisibleChange` 在 `busy` 时直接 return，挡住任何外部关闭。

**取舍**：`v-loading` 遮罩只盖住内容区，footer 在 `ElDialog` 的独立 slot 里，所以按钮要靠 `disabled` 单独处理。两者合起来才是「整窗禁止点击」。

### 9. 关闭即销毁

`ElDialog` 用 `destroy-on-close`：关闭动画结束后整棵子树卸载，包括内部 ProTable。再次打开时 ProTable 重新挂载、重新请求，分页与搜索状态自然归零。

`open` 变 `true` 时再显式清一次搜索框与缓存，防止 `destroy-on-close` 之外的时序留残值。

### 10. 分组数据由 props 初始化，内部持有副本

`groups` 是初始值，内部用 `ref` 持有副本（`watch` 到 props 变化时整体替换）。新建分组成功后把返回记录追加到副本并切过去。

**取舍**：这不是严格受控组件——新建的分组不会写到父组件的数组里。考虑到分组列表由 `createGroup` 的返回值驱动、父组件通常也会在自己的请求里拿到，这里选择「不回写」，避免引入 `update:groups` 的同步歧义。

### 11. 搜索防抖放在 FileModal

ProTable 的 `params` watch 是「变就更」，没有防抖。关键词每敲一个字都会触发一次请求，因此在 FileModal 里用 `debounce(300)` 把「输入值」与「生效关键词」分开。

`onBeforeUnmount` 里 `cancel()`，避免关闭弹窗后仍有一次延迟请求。

## Risks / Trade-offs

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| `destroy-on-close` 会销毁内部 ProTable | 每次打开都重新请求一次 | 这是期望行为：重新打开就要拿最新素材；`tableRef` 在关闭期间为 `undefined`，已用可选链 |
| 请求串行意味着慢请求会拖住后续请求 | 连续搜索时最后一屏结果出得晚 | 已用 300ms 防抖在前置层收敛触发次数；串行保证不会并发打满接口 |
| 上传成功后 `reload(true)` 依赖调用方把新素材放进第一页 | 若接口未按时间倒序，用户看不到刚传的图 | 文档中明确「上传后刷新回第一页」，排序由调用方接口保证 |
| 跨页选择依赖 id 缓存 | 预置 id 若无对应记录会被跳过 | 已在 `design.md` 与文档中说明 |
| `request` 是必填 | 组件不能脱离异步数据源使用 | 与 ProTable 一致；静态数据场景传 `async () => ({ data, total })` |
| `0` 在 FileModal 表示「自定义」，在 `CropperUpload` 表示「自由」 | 两处语义不同，容易混用 | FileModal 在打开裁剪前就把它换算成图片真实比例，从不把 `0` 传给裁剪器；文档分别说明 |
| 弹窗内嵌 `CropperDialog`（`append-to-body`） | 双层弹窗遮罩叠加，需要实测焦点与层级 | `CropperDialog` 早已 `append-to-body`，`ElDialog` 默认层级管理能处理；demo 覆盖该链路 |

## Migration Plan

- 纯新增组件，无破坏性变更。
- `CropperUpload` 的 `ratioLabels` 是可选 prop，不传时行为与之前完全一致（详见 `specs/cropper-upload/spec.md` 的场景）。
- 发版为 `minor`。

## Open Questions

无。分组回写（`update:groups`）若后续有明确需求，作为独立变更引入。
