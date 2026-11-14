# tasks

## 1. 帧渲染核心

- [ ] 1.1 `types/frame.ts`：`FrameFit`、`VideoFilterPreset`、七类效果参数、`FrameEffectMap`、`FrameRenderer`
- [ ] 1.2 `core/cssFilter.ts`：按 key 管理 filter 片段，合成后写入 `video.style.filter`
- [ ] 1.3 `core/frame.ts`：canvas 叠加层、工作画布、效果链合成、取色、rAF 循环与可见性控制
- [ ] 1.4 `core/style.ts`：覆盖层（开场动画、视频叠加）的样式表按需注入，类名统一 `wa-player-` 前缀
- [ ] 1.5 `PluginContext` 增加 `frame` / `cssFilter`，`registry` 懒创建并在 `dispose` 时回收

## 2. 插件

- [ ] 2.1 `webFullscreen`：开关 + 状态回写
- [ ] 2.2 `mosaic`：开关 + 块大小滑杆
- [ ] 2.3 `stabilizer`：开关 + 强度滑杆（帧间混合）
- [ ] 2.4 `blur`：开关 + 模糊半径滑杆
- [ ] 2.5 `reverse`：开关 + 倒放速率，rAF 反向步进
- [ ] 2.6 `backgroundBlur`：开关 + 模糊半径，前景保持比例
- [ ] 2.7 `intro`：图片 / 文字开场动画 + 重播菜单项
- [ ] 2.8 `overlay`：图片 / 视频叠加层，可拖拽，透明度与大小可调
- [ ] 2.9 `chromaKey`：取色、相似度、羽化、背景开关
- [ ] 2.10 `videoFilter`：预设选择 + 强度滑杆
- [ ] 2.11 `vertical`：开关 + 适配方式（裁切 / 完整 / 旋转）
- [ ] 2.12 注册到 `builtinPlugins`，补齐常量、图标、类型映射与包导出

## 3. 默认插件

- [ ] 3.1 `VideoPlayer` 的 `plugins` 默认值改为 `['filter', 'screenshot', 'webFullscreen', 'mosaic', 'blur', 'chromaKey']`
- [ ] 3.2 `element-pro` 的 `fileListVideoPlugins` 补 `screenshot`、`webFullscreen`、`mosaic`、`blur`、`chromaKey`

## 4. 验证与文档

- [ ] 4.1 更新 `tests/plugin.test.mjs`：插件数量、key 列表、新增插件的行为断言
- [ ] 4.2 新增 11 个文档页与 demo，另有「默认插件」页与「插件演示」页（一个视频切换默认插件效果），同步插件表、API 页、`README.md`
- [ ] 4.3 更新根 `AGENTS.md` 仓库地图与 `openspec/project.md` 的插件说明
- [ ] 4.4 新增 `.changeset/player-effects.md`（minor）
- [ ] 4.5 `pnpm lint`、`pnpm format:check`、`pnpm build`、`pnpm test`（player）
