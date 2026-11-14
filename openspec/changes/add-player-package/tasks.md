# add-player-package — 实施清单

> 目标：交付基于 artplayer 的 Vue 3 播放器组件包，插件配置走 key + setting 覆盖，内置 7 个插件各占右侧菜单一项，文档按插件分页。

## 1. 包骨架与构建

- [x] 1.1 创建 `packages/player/src`，含 `constant`、`types`、`core`、`plugins`、`VideoPlayer`、`demo`
- [x] 1.2 新增 `packages/player/package.json`：`@wapri/gplayer`、`version: 0.0.0`、`files: ["dist"]`、`sideEffects: false`、`main/module: dist/index.mjs`、`types: dist/index.d.ts`
- [x] 1.3 新增 `vite.config.ts`（lib 模式 + `vite-plugin-dts`，external：`vue` / `artplayer` / `@wapri/gbase`）与 `tsconfig.json`（含 `@wapri/gplayer`、`@wapri/gbase` 路径映射）
- [x] 1.4 新增 `src/shims-vue.d.ts`，让 `.vue` 导入有类型
- [x] 1.5 `build` 脚本为 `node ../../scripts/clean-dist.mjs && vite build`
- [x] 1.6 新增 `src/constant/index.ts`：`prefix`（`wa-player`）、默认容器比例、默认语速列表、默认比例列表、菜单文案
- [x] 1.7 新增 `src/constant/icons.ts`：AB 循环与画面调节的自定义 SVG 图标

## 2. 类型与内核

- [x] 2.1 `src/types/plugin.ts`：`PluginConfig`、七个内置插件配置类型、`PluginConfigMap`、`PluginSetting`、`PluginEntry`、`PluginInput`、`PluginContext`、`PluginDefinition`
- [x] 2.2 `src/types/player.ts`：`VideoPlayerProps`、`VideoPlayerInstance`、`VideoPlayerEmits`、`PlayerOption`
- [x] 2.3 `src/core/registry.ts`：模块初始化时用内置插件播种注册表，提供 `registerPlugin` / `definePlugin` / `pluginEntry` / `getPlugin` / `listPlugins` / `resolvePlugins` / `createPluginRunner`
- [x] 2.4 `src/core/option.ts`：props + `options` 合并成 `artplayer` 的 `Option`，剥掉 `undefined`
- [x] 2.5 输入归一化：字符串 / 对象 → `{ key, setting }`，同 key 去重、后出现覆盖，未知 key 警告后跳过
- [x] 2.6 `src/core/icon.ts`：复制 artplayer 内置图标，避免把控制条上的图标「搬走」

## 3. 内置插件

- [x] 3.1 `plugins/playbackRate.ts`：倍速选择，返回值回写副标题
- [x] 3.2 `plugins/aspectRatio.ts`：画面比例选择
- [x] 3.3 `plugins/flip.ts`：翻转方向选择
- [x] 3.4 `plugins/screenshot.ts`：Canvas 重绘（带 `filter`）+ `downloadBlob`，失败给 notice
- [x] 3.5 `plugins/pip.ts`：开关型，监听 `pip` 事件回写开关态，不支持时提示
- [x] 3.6 `plugins/abLoop.ts`：A/B 点设置与清除，`video:timeupdate` 回跳
- [x] 3.7 `plugins/filter.ts`：亮度/对比度/饱和度滑杆 + 重置
- [x] 3.8 `plugins/index.ts`：聚合导出 `builtinPlugins`

## 4. 组件

- [x] 4.1 `VideoPlayer/index.vue`：容器、创建/销毁实例、props 同步、事件转发、`defineExpose`
- [x] 4.2 `plugins` / `options` 变化时重建实例并恢复进度与播放状态
- [x] 4.3 `VideoPlayer/index.ts` + `core/install.ts`：默认导出 + `app.use()` 注册
- [x] 4.4 `src/index.ts`：导出组件、类型与注册函数

## 5. 文档站与演示

- [x] 5.1 `.dumirc.ts` 增加 `atomDirs`（`type: 'player'`）、`nav`（`/players`）、`alias`
- [x] 5.2 `src/index.md`：安装、快速开始、插件配置协议、内置插件表（链到各插件页）
- [x] 5.3 每个内置插件一页：`src/<plugin>/index.md` + 只启用该插件的 `demo/basic.vue`
- [x] 5.4 `src/custom/index.md` + demo：自定义插件注册与配置覆盖
- [x] 5.5 `src/api/index.md`：Props / Events / 实例方法 / 类型
- [x] 5.6 新增 `packages/player/README.md`、`CHANGELOG.md`、`docs/changelog/player.md`
- [x] 5.7 `.dumi/pages/index.tsx` 首页 `PROJECTS` 增加 player 卡片

## 6. 仓库登记

- [x] 6.1 新增 changeset：`"@wapri/gplayer": minor`
- [x] 6.2 根 `AGENTS.md` 仓库地图补充 `packages/player`
- [x] 6.3 `docs/guide.md` 子包清单与构建方式补充 player
- [x] 6.4 `openspec/project.md` 包表与依赖方向补充 player

## 7. 测试

- [x] 7.1 `tests/plugin.test.mjs`：配置解析（字符串 / 对象 / 去重 / 未知 key / `pluginEntry`）
- [x] 7.2 覆盖内置插件行为：倍速、比例、翻转、画中画、AB 回跳、滤镜还原
- [x] 7.3 覆盖清理回调：`dispose` 后监听与 `video.style.filter` 复原

## 8. 校验

- [x] 8.1 `pnpm install` 通过，新增依赖 `artplayer` 落盘
- [x] 8.2 `pnpm --filter @wapri/gplayer build` 通过，`dist/index.mjs` 与 `dist/index.d.ts` 存在
- [x] 8.3 `npx tsc -p packages/player/tsconfig.json --noEmit` 通过
- [x] 8.4 `pnpm lint` 无新增 error / warning（11 条 warning 仍全部来自 `@wapri/gbase` 历史 `any`）
- [x] 8.5 新增文件通过 `oxfmt --check`
- [x] 8.6 `pnpm build` 全量通过（7/7 tasks）
- [x] 8.7 `pnpm doc` 通过，产物包含 `/players` 与九个子页面
- [x] 8.8 `node --test packages/player/tests/plugin.test.mjs` 全部通过（13 条）
- [x] 8.9 `npx -y @fission-ai/openspec@latest validate add-player-package --strict` 通过
- [ ] 8.10 人工在浏览器确认：每个插件页右侧菜单出现对应项、截图页能出图
- [ ] 8.11 归档本 change 到 `openspec/changes/archive/`
