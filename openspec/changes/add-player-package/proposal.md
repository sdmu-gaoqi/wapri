# add-player-package

## Why

仓库没有视频播放能力。业务里播放视频目前有两种做法：直接用原生 `<video>`（控制条、快捷键、全屏、画中画、主题化全部要自己写），或者各自引一份 `artplayer` 再手写一遍初始化与销毁（重复代码、实例泄漏、插件注册散落各处）。

`artplayer` 本身能力完整，但它是命令式 API：创建实例、绑事件、加右侧菜单、销毁实例都由调用方负责；插件（`option.plugins`）只接受「函数数组」，没有 key、没有默认配置、也没有统一的菜单约定，业务想「开关某个插件」「改一下插件参数」都得改代码。

本变更交付 `@wapri/gplayer`：把 `artplayer` 封装成 Vue 3 组件，用声明式的 `plugins` 配置替代手写插件函数，并内置一组「一个插件 = 右侧菜单一项」的常用插件（倍速、画面比例、翻转、截图、画中画、AB 循环、画面调节）。

## What Changes

- 新增 workspace 包 `@wapri/gplayer`（`packages/player`，初始 `0.0.0`，`publishConfig.access: public`），依赖 `@wapri/gbase` 与 `artplayer`，`vue` 为 peer 依赖。
- 导出 Vue 3 组件 `VideoPlayer`：`url` / `poster` / `theme` / `lang` / `autoplay` / `muted` / `loop` / `volume` / `height` 等常用属性，其余 `artplayer` 配置通过 `options` 透传；顶层 props 优先于 `options`。
- 声明式插件配置：`plugins: Array<string | { key: string; setting?: (config) => Partial<config> }>`。字符串表示「存在即启用默认配置」，对象形式在默认配置基础上覆盖（`setting` 收到该插件的默认配置，返回要覆盖的部分），同一 key 只安装一次、后出现的配置优先。
- 插件注册表与扩展点：`registerPlugin` / `definePlugin` / `getPlugin`，业务可注册自己的插件，安装逻辑同样拿到右侧菜单 API。
- 内置插件 7 个，每个都在右侧菜单里占一项：`playbackRate`、`aspectRatio`、`flip`、`screenshot`、`pip`、`abLoop`、`filter`。
- 组件实例方法：`player`（原始 `Artplayer` 实例）、`play`、`pause`、`toggle`、`seek`、`screenshot`、`fullscreen`。
- 事件：`ready`、`play`、`pause`、`ended`、`timeupdate`、`seek`、`error`、`volumechange`、`ratechange`、`flip`、`pip`、`screenshot`、`fullscreen`、`fullscreen-web`、`destroy`。
- 生命周期：卸载时先执行插件清理回调，再 `destroy()`；`plugins` 变化时重建实例并恢复播放进度。
- 构建：vite lib（对齐 `element-pro`，因为要编译 SFC）+ `vite-plugin-dts`，`artplayer` / `vue` / `@wapri/gbase` 走 external。
- 文档站接入：`.dumirc.ts` 增加 `atomDirs`（`type: 'player'`）、导航 `/players`、别名；文档按「简介 / 每个内置插件一页 / 自定义插件 / API」拆分，每个插件页带自己的 demo；新增 `docs/changelog/player.md`、首页卡片。
- 插件协议的单测：`tests/plugin.test.mjs`（`node:test` + vite 构建），覆盖配置解析、内置插件写入、AB 回跳、滤镜还原与清理回调。
- 发布接入：changeset `minor`，不新增 CI 工作流。

## Impact

- Affected specs: `player`（新增能力：组件封装、插件配置协议、内置插件、实例方法、生命周期）
- Affected code:
  - 新增 `packages/player/**`：`constant`、`types`、`core`、`plugins`、`VideoPlayer`、`demo`
  - 修改 `.dumirc.ts`（`resolve.atomDirs`、`themeConfig.nav`、`alias`）
  - 修改 `.dumi/pages/index.tsx`（首页卡片）、`docs/guide.md`（子包清单）、根 `AGENTS.md`（仓库地图）、`openspec/project.md`（包表）
  - 新增 `docs/changelog/player.md`、`.changeset/player-initial.md`
- 兼容性：纯新增包，现有包无破坏性变更。
