## ADDED Requirements

### Requirement: 视频预览使用播放器组件

`FileList` 的视频弹窗 SHALL 使用 `@wapri/gplayer` 的 `VideoPlayer` 渲染，而不是原生 `<video>` 标签。

#### Scenario: 打开视频预览

- **WHEN** 点击识别为视频的卡片或预览按钮
- **THEN** 弹窗标题为文件名称
- **AND** 弹窗内是播放器组件，地址取 `previewUrl`
- **AND** 卡片有 `abbreviateUrl` 时作为封面

#### Scenario: 关闭弹窗释放实例

- **WHEN** 关闭视频弹窗
- **THEN** 播放器实例被销毁，不残留监听与定时器
- **AND** 再次打开另一个视频时新建实例，不复用旧实例

### Requirement: 默认插件

`FileList` SHALL 默认启用 `playbackRate`、`aspectRatio`、`filter`、`flip`、`pip` 五个播放器插件，每个插件在播放器右侧设置菜单占一项。

#### Scenario: 默认菜单项

- **WHEN** 打开视频预览并展开右侧设置菜单
- **THEN** 菜单里能看到播放速度、画面比例、画面翻转、画中画、画面调节五项
- **AND** 选择倍速会改变播放速度，拖动画面调节会改变画面

### Requirement: 插件配置透传

`FileList` SHALL 提供 `videoPlugins` 属性（`PluginInput[]`），原样透传给 `VideoPlayer` 的 `plugins`。

#### Scenario: 覆盖插件配置

- **WHEN** 传入 `:video-plugins="[{ key: 'screenshot', setting: () => ({ filename: 'cover' }) }]"`
- **THEN** 视频弹窗只启用截图插件
- **AND** 截图文件名前缀为 `cover`

#### Scenario: 关闭全部插件

- **WHEN** 传入 `:video-plugins="[]"`
- **THEN** 弹窗内不出现插件对应的菜单项
- **AND** 播放控制仍可用
