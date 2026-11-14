# add-player-effects

## Why

`@wapri/gplayer` 目前只有七个偏「播放控制」的插件：倍速、比例、翻转、截图、画中画、AB 循环、画面调节。业务侧的短视频、课程、监控场景还需要一批「改画面」的能力：给人物局部打码、把横屏素材投到竖屏信息流、绿幕素材换底、老片加滤镜、片头加品牌动画。

这些能力都要改视频帧本身，现有插件只写 `video.style.filter`，一旦两个插件同时写就会互相覆盖，也没有逐帧处理的入口。本变更补一层共享的帧渲染管线，把「改画面」拆成可叠加的效果参数，再按此新增 10 个插件，并把常用的滤镜、截图、网页全屏纳入播放器默认插件。

## What Changes

- 新增帧渲染核心 `core/frame.ts`：在播放器内叠加一层 canvas，把视频帧画到工作画布上，按 `绿幕 → 马赛克 → 整画面模糊 → 视频滤镜 → 背景模糊 → 防抖 → 竖向适配` 的顺序合成。工作画布长边限制在 1280（绿幕 960），避免 4K 素材拖垮帧率。
- 新增 CSS filter 合成栈 `core/cssFilter.ts`：按 key 管理 filter 片段，多个插件同时写 `video.style.filter` 不会互相覆盖；`filter` 插件改为走它，对外行为不变。
- `PluginContext` 新增 `frame`（帧渲染器）与 `cssFilter`（合成栈）两个字段，自定义插件同样可用；两者懒创建，无 DOM 环境下降级为空实现。
- 新增 11 个内置插件：`webFullscreen`（网页全屏）、`mosaic`（马赛克）、`stabilizer`（防抖）、`blur`（模糊）、`reverse`（倒放）、`backgroundBlur`（背景模糊）、`intro`（开场动画）、`overlay`（视频叠加）、`chromaKey`（绿幕编辑器）、`videoFilter`（视频滤镜）、`vertical`（横屏转竖屏）。
- 每个插件一个 `PluginConfigMap` 条目、一条右侧菜单、一个文档页与 demo。
- 播放器默认插件由 `[]` 改为 `['filter', 'screenshot', 'webFullscreen', 'mosaic', 'blur', 'chromaKey']`；`element-pro` 的 `FileList` 默认插件同步补 `screenshot`、`webFullscreen`、`mosaic`、`blur`、`chromaKey`。
- 版本按 minor 记（新增能力，无破坏性变更）。

## Impact

- Affected specs: `player`（新增帧渲染管线与 11 个内置插件、默认插件变化）
- Affected code:
  - 新增 `packages/player/src/types/frame.ts`、`src/core/frame.ts`、`src/core/cssFilter.ts`、`src/core/style.ts`
  - 新增 `packages/player/src/constant/effect.ts`、`src/constant/filters.ts`、11 个 `src/plugins/*.ts`
  - 修改 `packages/player/src/types/plugin.ts`（配置类型与 `PluginContext`）、`src/core/registry.ts`、`src/plugins/index.ts`、`src/constant/{index,icons}.ts`、`src/index.ts`、`src/VideoPlayer/index.vue`
  - 修改 `packages/element-pro/src/constant/index.ts`（`fileListVideoPlugins`）
  - 新增 11 个 `packages/player/src/<kebab-name>/` 文档页与 demo，更新 `src/index.md`、`src/api/index.md`、`README.md`、`AGENTS.md` 仓库地图
  - 新增 `.changeset/player-effects.md`
- 兼容性：已有 7 个插件的 key 与配置不变；`filter` 插件内部改走合成栈，`video.style.filter` 的最终值不变。默认插件变化会让未传 `plugins` 的使用方多出三个菜单项，属于可见行为变化，按 minor 记录。
- 已知限制：帧效果走 canvas 重绘，视频源需允许跨域才能取像素（绿幕取色、截图）；`screenshot` 插件仍按原始帧出图，不包含 canvas 上的效果。
