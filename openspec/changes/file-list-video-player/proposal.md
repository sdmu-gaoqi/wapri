# file-list-video-player

## Why

`FileList` 的视频预览现在是 `<video controls autoplay>`，能力只有浏览器默认控制条：没有倍速、没有画面比例、没有画中画，业务想在弹窗里调一下画面也无从下手。仓库里刚交付的 `@wapri/gplayer` 已经把这些能力做成了可配置插件，`FileList` 再维护一套原生 `<video>` 没有意义。

本变更把 `FileList` 的视频弹窗换成 `@wapri/gplayer` 的 `VideoPlayer`，默认打开倍速、画面比例、画面调节、画面翻转、画中画五个插件，并把插件配置开放为 prop 透传。

## What Changes

- `@wapri/element-pro` 新增依赖 `@wapri/gplayer`（`workspace:^`），构建 external 加进白名单，不把播放器内核打进组件库产物。
- `FileList` 的视频弹窗由 `<video controls autoplay>` 换成 `<VideoPlayer>`：保留 `previewUrl` 作为地址、`abbreviateUrl` 作为封面、打开即播。
- 新增 prop `videoPlugins?: PluginInput[]`，默认 `['playbackRate', 'aspectRatio', 'filter', 'flip', 'pip']`；传空数组即回到只有原生控制条的状态，写法与播放器一致（字符串 / `{ key, setting }` / `pluginEntry`）。
- 样式：`.wa-ui-file-list__video` 从 `<video>` 挪到播放器容器上，宽度 100%、最高 70vh、黑底。
- 文档：`FileList` 的「预览分流」表格与 Props 表更新，新增「视频预览」小节说明默认插件与透传写法。

## Impact

- Affected specs: `file-list`（视频预览从原生 `<video>` 换成播放器组件）
- Affected code:
  - 修改 `packages/element-pro/package.json`、`vite.config.ts`（依赖与 external）
  - 修改 `packages/element-pro/src/FileList/{index.vue,types.ts,styles/index.scss,index.md}`
  - 修改 `packages/element-pro/src/constant/index.ts`（默认插件常量）
  - 修改 `openspec/project.md`（element-pro 的依赖方向补 gplayer）
  - 新增 `.changeset/file-list-video-player.md`
- 兼容性：`FileList` 的 props / events 不变，新增一个可选 prop；弹窗内 DOM 由 `<video>` 变成播放器容器，若业务覆盖过 `.wa-ui-file-list__video` 的直接子元素样式需要跟着调整。
