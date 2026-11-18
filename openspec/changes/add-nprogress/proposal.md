# add-nprogress

## Why

中后台里「页面级异步」很常见：路由切换、首屏拉数据、批量导入、导出下载。这类操作需要一个**挂在页面顶部、自己会走、走完自动消失**的进度提示，而 `element-plus` 的 `ElProgress` 是区块内的静态进度条，做不了这件事。

现在每个业务要么自己 `pnpm add nprogress`，要么手写一条 `div` + `setTimeout`：前者多一个运行时依赖、样式与本库主题色不联动（默认蓝色 `#29d`），后者容易写出「忘记收尾、路由切换后进度条卡在 90%」的 bug。

`element-pro` 已统一透出 element-plus 的函数式反馈（`ElMessage` / `ElMessageBox` / `ElLoading`），这里补齐同类能力：**函数式调用的顶部进度条**，`NProgress.start()` / `NProgress.done()` 两行接进路由守卫或请求拦截器，样式跟随 `--el-color-primary`，不新增依赖。

## What Changes

- 新增目录 `packages/element-pro/src/NProgress/`，对应 dumi 文档页 `/element-pros/nprogress`。
- 新增函数式 API（不提供组件标签，不需要写进模板）：
  - `NProgress.start()` / `done(force?)` / `inc(amount?)` / `set(value)` / `trickle()` / `remove()` / `isStarted()`
  - `NProgress.configure(options)`：`minimum`、`maximum`、`trickle`、`trickleSpeed`、`showSpinner`、`speed`、`easing`、`parent`、`zIndex`、`color`
  - `NProgress.status`（`number | null`）与 `NProgress.settings`（补全默认值后的配置）
- 新增 `createNProgress(options?)`：返回独立实例，用在微前端或「弹窗内局部进度」这类需要与全局进度条并存的场景。
- 实现要点：
  - 首次 `start()` 时才创建 DOM，挂到 `body`（或 `parent` 指定的容器），进度到 `maximum` 后按 `speed` 先走完、再淡出、最后移除节点，不留残骸。
  - `trickle` 打开时按 `trickleSpeed` 自动递增，进度越高步长越小，最高停在 `0.994`，剩下的留给 `done()`。
  - `start()` 幂等：重复调用不会把已经在走的进度重置回起点；淡出期间再次 `start()` 会取消收尾定时器。
  - 无 `document` 的环境（SSR / Node）下所有方法为空操作。
  - 颜色、高度、层级、过渡时长全部走 CSS 变量，默认取 `--el-color-primary`，宿主换主题色时自动跟随。
- `packages/element-pro/src/index.ts` 导出 `NProgress`、`createNProgress` 与相关类型；**不加入 `components` 注册数组**（它不是组件）。
- 新增 dumi 文档页 `src/NProgress/index.md` 与两个可运行 demo（手动控制、配置项）。
- 新增 `packages/element-pro/tests/nprogress.test.mjs`，覆盖挂载、递增、配置、收尾与多实例。
- 新增 changeset（`minor`）。

## Capabilities

### New Capabilities

- `nprogress`: 顶部进度条的函数式生命周期、手动控制、自动递增与主题化配置。

### Modified Capabilities

无。既有组件与 `element-plus` 透出行为不变。

## Impact

- Affected specs: `nprogress`（新增能力）
- Affected code:
  - 新增 `packages/element-pro/src/NProgress/{index.ts,create.ts,types.ts}`
  - 新增 `packages/element-pro/src/NProgress/{index.md,demo/basic.vue,demo/configure.vue}`
  - 新增 `packages/element-pro/src/NProgress/styles/index.scss`
  - 新增 `packages/element-pro/tests/nprogress.test.mjs`
  - 修改 `packages/element-pro/src/constant/index.ts`（默认配置、自动递增步长、可达上限）
  - 修改 `packages/element-pro/src/index.ts`（导出，不注册）
  - 新增 `.changeset/nprogress.md`
- 兼容性：纯新增能力，不改动既有导出与样式；`NProgress` 与 `ElProgress` 无命名冲突。
- 依赖：不新增依赖，实现不基于第三方 `nprogress`，API 与其对齐（`start` / `done` / `inc` / `set` / `trickle` / `configure` / `remove` / `isStarted` / `status` / `settings`）。
- 不在本次范围：Vue 组件形态的进度条、`vue-router` / `axios` 适配器（文档只给接入示例），以及 `ProConfigProvider` 的全局 prefix 联动（函数式 API 不在组件树内，统一使用默认前缀）。
