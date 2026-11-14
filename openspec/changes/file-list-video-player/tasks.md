# file-list-video-player — 实施清单

> 目标：`FileList` 的视频弹窗换成 `@wapri/gplayer` 的 `VideoPlayer`，默认五个插件，插件配置可透传。

## 1. 依赖与构建

- [x] 1.1 `packages/element-pro/package.json` 增加 `@wapri/gplayer: workspace:^`
- [x] 1.2 `vite.config.ts` 的 external 白名单加 `@wapri/gplayer`，不把播放器内核打进组件库产物

## 2. 组件改造

- [x] 2.1 `FileList/types.ts` 增加 `videoPlugins?: PluginInput[]`
- [x] 2.2 `constant` 增加 `fileListVideoPlugins`（`playbackRate` / `aspectRatio` / `filter` / `flip` / `pip`）
- [x] 2.3 `FileList/index.vue` 视频弹窗由 `<video>` 换成 `<VideoPlayer>`，透传 `url` / `poster` / `plugins`，保留打开即播
- [x] 2.4 预览状态增加 `previewPoster`，打开与关闭时同步维护
- [x] 2.5 `.wa-ui-file-list__video` 样式改到播放器容器（宽度 100%、最高 70vh、圆角、黑底）

## 3. 文档

- [x] 3.1 `FileList/index.md` 的「预览分流」表格改成播放器组件
- [x] 3.2 新增「视频预览」小节：默认插件表 + `videoPlugins` 透传示例 + `[]` 关闭插件
- [x] 3.3 Props 表补 `videoPlugins`

## 4. 仓库登记

- [x] 4.1 新增 changeset：`"@wapri/element-pro": minor`
- [x] 4.2 `openspec/project.md` 的依赖方向补 element-pro → gplayer

## 5. 校验

- [ ] 5.1 `pnpm --filter @wapri/element-pro build` 通过，产物 external 引入 `@wapri/gplayer`
- [ ] 5.2 `packages/element-pro/tests/file-list.test.mjs` 通过
- [ ] 5.3 `pnpm lint` 无新增 error / warning
- [ ] 5.4 新增文件通过 `oxfmt --check`
- [ ] 5.5 `pnpm doc` 通过，FileList 页面内视频预览可打开
- [ ] 5.6 `npx -y @fission-ai/openspec@latest validate file-list-video-player --strict` 通过
