## ADDED Requirements

### Requirement: 帧渲染管线

播放器 SHALL 提供一层可叠加的帧渲染管线，把视频帧画到 canvas 上再合成输出，供需要改画面的插件共用。

#### Scenario: 多个效果叠加

- **WHEN** 同时启用马赛克与视频滤镜
- **THEN** 两效果同时作用在同一帧上，顺序固定为绿幕 → 马赛克 → 模糊 → 视频滤镜 → 背景模糊 → 防抖
- **AND** 后启用的插件不会覆盖先前插件的效果

#### Scenario: 无效果时不占开销

- **WHEN** 没有任何帧效果插件启用
- **THEN** 不创建 canvas 覆盖层，视频元素按原样显示
- **AND** 不启动逐帧渲染循环

#### Scenario: 画面未就绪

- **WHEN** 视频尚未解码出首帧（`readyState < 2`）
- **THEN** 覆盖层隐藏，封面与加载态按原样显示
- **AND** 首帧就绪后自动恢复绘制

#### Scenario: 视频源跨域

- **WHEN** 视频源未开启 CORS，取像素的操作被浏览器拦截
- **THEN** 取色返回 `null` 并提示，不抛出未捕获异常

### Requirement: CSS filter 合成栈

多个插件同时写 `video.style.filter` 时 SHALL 合并输出，而不是互相覆盖。

#### Scenario: 画面调节与视频滤镜共存

- **WHEN** 同时启用 `filter` 与 `videoFilter`
- **THEN** `video.style.filter` 同时包含亮度、对比度、饱和度与预设滤镜的片段
- **AND** 任一插件关闭后只移除自己的片段

### Requirement: 内置插件

包 SHALL 内置 18 个插件，每个插件在右侧设置菜单占一项，key 稳定。

#### Scenario: 新增插件可通过 key 启用

- **WHEN** `plugins` 传入 `'mosaic'`、`'chromaKey'`、`'vertical'` 等新 key
- **THEN** 对应的菜单项出现，功能可用
- **AND** 传入未注册的 key 仍然跳过并告警

#### Scenario: 插件配置覆盖

- **WHEN** 用 `pluginEntry('mosaic', (config) => ({ ...config, size: 32 }))` 覆盖默认配置
- **THEN** 初始块大小按 32 生效
- **AND** 未覆盖的字段沿用默认值

### Requirement: 播放器默认插件

`VideoPlayer` 未传 `plugins` 时 SHALL 默认启用 `filter`、`screenshot`、`webFullscreen`、`mosaic`、`blur`、`chromaKey` 六项。

#### Scenario: 默认菜单

- **WHEN** 使用 `<VideoPlayer url="..." />` 且不传 `plugins`
- **THEN** 右侧设置菜单出现画面调节、截图、网页全屏、马赛克、模糊、绿幕六项
- **AND** 马赛克、模糊、绿幕的效果开关默认关闭，菜单项可见但不改画面
- **AND** 传入 `:plugins="[]"` 时菜单不出现插件项

### Requirement: 倒放

倒放插件 SHALL 在开启后让播放进度反向推进。

#### Scenario: 开启倒放

- **WHEN** 打开倒放开关
- **THEN** 原生播放暂停，画面按帧反向退到起点
- **AND** 关闭开关后恢复正向播放控制

### Requirement: 绿幕编辑器

绿幕插件 SHALL 支持在画面上取色作为抠像颜色，并调节相似度与边缘羽化。

#### Scenario: 吸管取色

- **WHEN** 点击「吸取背景色」后在画面上点选
- **THEN** 该点颜色被设为抠像颜色，菜单副标题显示色值
- **AND** 相近颜色的像素变为透明

### Requirement: 横屏转竖屏

竖屏插件 SHALL 把横屏素材适配到 9:16 容器，支持裁切、完整显示与旋转 90° 三种方式。

#### Scenario: 裁切模式

- **WHEN** 开启竖屏并选择「裁切」
- **THEN** 容器比例变为 9:16，画面居中裁切铺满
- **AND** 关闭后恢复开启前的画面比例
