# @wapri/gplayer

## 0.2.0

### Minor Changes

- 新增共享的帧渲染管线（canvas 叠加层 + CSS filter 合成栈）与 11 个内置插件：`webFullscreen`、`videoFilter`、`mosaic`、`blur`、`backgroundBlur`、`stabilizer`、`chromaKey`、`vertical`、`reverse`、`intro`、`overlay`。`PluginContext` 增加 `frame` 与 `cssFilter`，自定义插件同样可用。

  播放器默认插件由空数组改为 `filter`、`screenshot`、`webFullscreen`、`mosaic`、`blur`、`chromaKey`（后三个开关默认关闭），默认列表以 `defaultPlayerPlugins` 导出，方便「默认 + 追加」；`element-pro` 的 `FileList` 视频预览同步补齐这批插件。截图仍按原始帧出图，不包含 canvas 上的帧效果。

## 0.1.1

### Patch Changes

- Updated dependencies
  - @wapri/gbase@2.3.1

## 0.1.0

### Minor Changes

- 新增 player 包：基于 artplayer 的 Vue 3 视频播放器组件，插件以 `key` + `setting` 覆盖的形式声明，内置 `playbackRate`、`aspectRatio`、`flip`、`screenshot`、`pip`、`abLoop`、`filter` 七个插件，每个插件在右侧设置菜单各占一项；同时提供 `registerPlugin` / `definePlugin` / `pluginEntry` 支持业务自定义插件。

### Patch Changes

- Updated dependencies
  - @wapri/gbase@2.3.0

## 0.0.0

初始版本待发布。
