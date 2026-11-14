# add-player-package — 设计

## Context

`artplayer` 的扩展点是 `option.plugins: ((art) => unknown)[]` 和 `art.setting.add()`。前者只认函数、没有标识也没有默认配置；后者是右侧设置菜单，天然适合承载「一个插件一个菜单项」。

Vue 侧需要解决三件事：实例的创建与销毁跟着组件走；`artplayer` 的命令式 API 能用 props 表达；插件既要能按需开启，也要能改配置。

## Goals / Non-Goals

**Goals**

- `<VideoPlayer>` 一个标签跑起来，卸载时不留实例、不留监听。
- 插件以 「key + 可选配置覆盖」 声明，内置插件开箱即用，业务插件可注册。
- 每个内置插件在右侧菜单有一项，菜单文案/图标/状态由插件自己负责。
- 不包裹、不隐藏 `Artplayer` 实例：业务需要底层能力时直接拿。

**Non-Goals**

- 不做播放器内核（解码、流协议）；HLS / FLV 等由业务通过 `options.customType` 或 artplayer 生态插件自行接入。
- 不做播放列表、弹幕、字幕编辑等业务型能力。
- 不改 `artplayer` 的 DOM 结构与样式，只叠加菜单项与视频元素上的滤镜。

## Decisions

### 1. 构建用 vite，而不是 father

包内要交付 `.vue` SFC，`father` 需要额外接 SFC 编译链；`element-pro` 已经用 `vite + vite-plugin-dts` 跑通组件库产物（`dist/index.mjs` + `dist/index.d.ts`）。这里对齐 `element-pro`，`external` 白名单为 `vue` / `artplayer` / `@wapri/gbase`。

### 2. `plugins` 用「key + setting 覆盖函数」，而不是插件对象

```ts
plugins: [
  'screenshot',                                  // 存在即启用，走默认配置
  { key: 'playbackRate', setting: (config) => ({ rates: [1, 1.5, 2] }) },
]
```

- `setting` 收到该插件的**默认配置**，返回需要覆盖的部分，最终配置为 `{ ...默认配置, ...返回值 }`。取默认配置入参而不是空对象，是因为业务通常只改其中一个字段，其余要沿用默认值。
- 同一个 key 出现多次只安装一次，后出现的覆盖先出现的配置，避免右侧菜单出现两个同名项。
- 未知 key 不抛错：`console.warn` 后跳过，避免「一个插件名写错导致整页白屏」。

替代方案（被否）：`plugins: { key: config }` 对象形式。省一点字符，但丢失「字符串即启用」的简写，也没法表达「同一个插件注册多份」。

### 3. 内置插件 = 注册表 + 安装函数

```ts
interface PluginDefinition<T> {
  key: string
  label: string
  defaultConfig: T
  install(context: PluginContext, config: T): void
}
```

`install` 拿到的是封装过的 `PluginContext`（`art` + `setting` + `onCleanup`），而不是裸 `Artplayer`：

- `setting(option)` 直接往右侧菜单追加一项，并把 `art.setting.add` 的返回值（菜单项本体）暴露出来，插件想改自己的文案/开关状态不必再 `find`。
- `onCleanup(fn)` 收集卸载回调。`art.destroy()` 会清掉 artplayer 自己的监听，但 `setTimeout`、`requestAnimationFrame`、`video.style.filter` 这类副作用它不知道，必须由插件自己收尾。
- 注册表在模块初始化时用内置插件播种，不依赖 `import './plugins'` 这类副作用导入——`package.json` 是 `sideEffects: false`，副作用导入会被打包器摇掉。

### 4. 内置插件边界

| key | 交互 | 落在哪 |
| --- | --- | --- |
| `playbackRate` | 选择倍速 | `art.playbackRate` |
| `aspectRatio` | 选择画面比例 | `art.aspectRatio` |
| `flip` | 选择翻转方向 | `art.flip` |
| `screenshot` | 点击截图 | Canvas 重绘 `art.video` + `downloadBlob` |
| `pip` | 开关 | `art.pip`，并监听 `pip` 事件回写开关态 |
| `abLoop` | 设 A / 设 B / 清除 | `video:timeupdate` 里回跳 |
| `filter` | 亮度/对比度/饱和度滑杆 + 重置 | `video.style.filter` |

- 截图不复用 `art.screenshot()`：它只能输出 PNG 且文件名固定，业务需要格式、质量、文件名前缀。自己重绘 canvas 还能带上 `filter` 插件的滤镜值（`ctx.filter`）。
- 翻转复用 `art.flip`（artplayer 用 `data-flip` + CSS 实现），不自己改 `video.style.transform`，避免和未来的旋转类插件抢同一个属性。

### 5. `plugins` 变化时重建实例

`artplayer` 的 `option.plugins` 只在构造时读取，运行期没有「卸载某个插件」的 API（`setting.remove` 只删菜单项，`install` 里挂的监听还在）。所以 `plugins` 变化时按「销毁 → 重建」处理，并恢复 `currentTime` / 播放状态，让动态开关插件的体验接近无缝。

### 6. 顶层 props 与 `options` 的优先级

`options` 是 `artplayer` 配置的原样透传口。合并顺序为：组件默认值 → `options` → 顶层 props（仅当显式传了值）。这样 `theme` 这类高频属性有独立 prop，冷门配置又不会被封装挡掉。

## Risks / Trade-offs

- **截图受跨域限制**：canvas 重绘要求视频源带 CORS 头，否则 `toDataURL` 抛 `SecurityError`。处理方式是给 `art.notice` 一条明确提示，不吞异常。文档与 demo 都要写清楚。
- **`filter` 用内联 `style.filter`**：与业务自己设置的滤镜互斥，重置即清空。
- **重建实例会丢全屏/画中画状态**：只在 `plugins` 变化时发生，属于低频操作。
- **`artplayer` 版本漂移**：内部用到 `art.setting.add` 的返回值和 `art.icons`，属于公开 API 但类型声明不完整（`SettingOption` 需要断言）。升级 `artplayer` 时以 `tests` 之外的人工冒烟为准。

## Migration Plan

纯新增包，无迁移。业务侧从 `new Artplayer(...)` 切过来时：`url` 保留，`container` 去掉（组件内部管理），`plugins` 里的函数换成 key 字符串。

## Open Questions

- 是否需要把「插件默认开启」做成可配置（例如 `plugins: ['screenshot']` 之外的 `defaultPlugins`）？当前结论：不需要，业务显式写出更好读。
