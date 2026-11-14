---
'@wapri/element-pro': minor
---

FileList 的视频预览改用 `@wapri/gplayer` 的 `VideoPlayer`：默认启用倍速、画面比例、画面调节、画面翻转、画中画五个插件，新增 `videoPlugins` 属性透传插件配置（`PluginInput[]`，传 `[]` 关闭全部插件）。视频弹窗内的 DOM 由 `<video>` 变成播放器容器，覆盖过 `.wa-ui-file-list__video` 子元素样式的业务需要跟着调整。
