## ADDED Requirements

### Requirement: 包身份与目录位置

仓库 SHALL 在 `packages/player` 提供名为 `@wapri/gplayer` 的 workspace 包，初始版本 `0.0.0`，可被 pnpm workspace 与文档站解析到。

#### Scenario: workspace 能识别新包

- **WHEN** 在仓库根目录执行 `pnpm ls -r --depth -1`
- **THEN** 输出中包含 `@wapri/gplayer`
- **AND** 其路径指向 `packages/player`

#### Scenario: 包元信息符合发布约定

- **WHEN** 读取 `packages/player/package.json`
- **THEN** `files` 为 `["dist"]`，`sideEffects` 为 `false`
- **AND** `module` 指向 `dist/index.mjs`，`types` 指向 `dist/index.d.ts`
- **AND** `publishConfig.access` 为 `public`，`publishConfig.registry` 为 `https://registry.npmjs.org/`

### Requirement: 依赖边界

`@wapri/gplayer` SHALL 只依赖 `@wapri/gbase` 作为工作区内部包，播放能力由 `artplayer` 提供，`vue` 作为 peer 依赖由使用方安装。

#### Scenario: 依赖清单符合预期

- **WHEN** 读取 `packages/player/package.json`
- **THEN** 工作区内部依赖仅 `@wapri/gbase: workspace:^`
- **AND** `dependencies` 中包含 `artplayer`
- **AND** `vue` 出现在 `peerDependencies` 而不是 `dependencies`

#### Scenario: 基础能力复用 gbase

- **WHEN** 在 `packages/player/src` 中检索 `localStorage`、`sessionStorage`
- **THEN** 无直接使用
- **AND** 截图落盘走 `@wapri/gbase` 的 `downloadBlob`

### Requirement: 组件基础播放

`<VideoPlayer>` SHALL 在挂载时创建 `Artplayer` 实例，并在 `url` 等属性变化时同步到实例，调用方无需接触 `container`。

#### Scenario: 传入地址即可播放

- **WHEN** 渲染 `<VideoPlayer url="https://www.w3schools.com/html/mov_bbb.mp4#t=0.1" />`
- **THEN** 组件容器内出现 `artplayer` 的播放器 DOM
- **AND** 点击播放后触发 `play` 事件
- **AND** 不传 `container` 也能正常渲染

#### Scenario: 常用属性映射到实例

- **WHEN** 渲染时传入 `poster`、`theme`、`volume`、`muted`、`loop`
- **THEN** 实例的 `poster`、`theme`、`volume`、`muted` 与入参一致
- **AND** 视频元素的 `loop` 与入参一致

#### Scenario: 其余配置透传

- **WHEN** 通过 `options` 传入 `isLive`、`autoSize` 等 `artplayer` 原生配置
- **THEN** 这些配置原样进入实例
- **AND** 同名配置同时出现在 `options` 与顶层 prop 时，以顶层 prop 为准

#### Scenario: 容器高度可控

- **WHEN** 不传 `height`
- **THEN** 容器宽度撑满父级，高度按 16:9 自适应
- **AND** 传入 `height`（数字按 px）时容器使用该高度

### Requirement: 插件配置协议

`plugins` SHALL 接受 `Array<string | { key: string; setting?: (config) => Partial<config> }>`，按 key 解析为内置或已注册插件并安装。

#### Scenario: 字符串即启用

- **WHEN** `plugins` 为 `['screenshot']`
- **THEN** 截图插件以默认配置安装
- **AND** 右侧菜单出现截图对应的一项

#### Scenario: setting 覆盖默认配置

- **WHEN** `plugins` 为 `[{ key: 'playbackRate', setting: (config) => ({ rates: [1, 2] }) }]`
- **THEN** `setting` 收到的入参是该插件的完整默认配置
- **AND** 最终配置为默认配置与返回值的浅合并结果
- **AND** 右侧菜单只列出 `1x` 与 `2x` 两个倍速

#### Scenario: 重复 key 只安装一次

- **WHEN** `plugins` 为 `['flip', { key: 'flip', setting: () => ({ modes: ['normal'] }) }]`
- **THEN** 右侧菜单只有一项翻转
- **AND** 生效的是后出现的配置

#### Scenario: 未知 key 不阻断渲染

- **WHEN** `plugins` 中包含未注册的 key
- **THEN** 该插件被跳过
- **AND** 控制台输出一条警告
- **AND** 其余插件与播放功能正常

### Requirement: 内置插件

包 SHALL 内置 `playbackRate`、`aspectRatio`、`flip`、`screenshot`、`pip`、`abLoop`、`filter` 七个插件，每个插件在右侧菜单占一项。

#### Scenario: 每个插件一个菜单项

- **WHEN** 同时启用七个内置插件并打开右侧菜单
- **THEN** 菜单中出现七个插件对应的项
- **AND** 每一项的文案与插件 `label` 一致

#### Scenario: 倍速 / 画面比例 / 翻转是选择型

- **WHEN** 在倍速菜单里选择 `1.5x`
- **THEN** `player.playbackRate` 变为 `1.5`
- **AND** 菜单项的副标题回写为 `1.5x`
- **AND** 画面比例与翻转的选择行为同理，分别写入 `aspectRatio` 与 `flip`

#### Scenario: 画中画是开关型

- **WHEN** 点击画中画菜单项
- **THEN** 菜单项开关状态与 `player.pip` 一致
- **AND** 浏览器不支持画中画时给出提示而不是抛错

#### Scenario: 截图输出到本地

- **WHEN** 点击截图菜单项
- **THEN** 按插件配置的格式与质量生成图片并下载
- **AND** 文件名包含插件配置的文件名前缀与当前播放时间
- **AND** 视频源未开启 CORS 时提示失败原因，不抛未捕获异常

#### Scenario: AB 循环

- **WHEN** 在播放到第 3 秒时设置 A 点，第 6 秒时设置 B 点
- **THEN** 播放到 B 点后自动跳回 A 点
- **AND** 清除后不再回跳
- **AND** 菜单项副标题展示已设置的区间

#### Scenario: 画面调节

- **WHEN** 拖动亮度滑杆
- **THEN** 视频元素的 `filter` 实时更新
- **AND** 点击重置后 `filter` 被清空

### Requirement: 插件扩展

包 SHALL 提供 `registerPlugin`、`definePlugin`、`getPlugin`，业务可以注册自己的插件并在 `plugins` 里用 key 启用。

#### Scenario: 注册并使用自定义插件

- **WHEN** 调用 `registerPlugin(definePlugin({ key: 'watermark', label: '水印', defaultConfig: {...}, install }))`
- **THEN** `getPlugin('watermark')` 返回该定义
- **AND** `plugins: ['watermark']` 能安装它
- **AND** `install` 拿到的 `context.setting` 可以往右侧菜单追加菜单项

#### Scenario: 自定义插件同样支持配置覆盖

- **WHEN** `plugins` 为 `[{ key: 'watermark', setting: (config) => ({ text: 'wapri' }) }]`
- **THEN** `install` 收到的配置里 `text` 为 `wapri`，其余字段保持默认

### Requirement: 实例方法与事件

组件 SHALL 通过 `defineExpose` 暴露原始实例与常用操作，并把 `artplayer` 的关键事件转为 Vue 事件。

#### Scenario: 拿到原始实例

- **WHEN** 通过模板 ref 访问组件
- **THEN** `.player` 是 `Artplayer` 实例
- **AND** `.play()` / `.pause()` / `.toggle()` / `.seek(time)` / `.screenshot(name)` / `.fullscreen(state)` 可用

#### Scenario: 事件透出

- **WHEN** 播放、暂停、播放结束、时间推进、全屏、画中画、翻转、截图
- **THEN** 分别触发 `play`、`pause`、`ended`、`timeupdate`、`fullscreen`、`pip`、`flip`、`screenshot`
- **AND** 带上 `artplayer` 原始事件参数

### Requirement: 生命周期与资源释放

组件 SHALL 在卸载时先执行插件清理回调再销毁实例，并在 `plugins` 变化时重建实例。

#### Scenario: 卸载不留副作用

- **WHEN** 组件被卸载
- **THEN** 插件通过 `context.onCleanup` 注册的回调全部执行
- **AND** `Artplayer` 实例的 `isDestroy` 为 `true`
- **AND** 组件容器被移除

#### Scenario: 动态开关插件

- **WHEN** 运行期从 `plugins` 中移除某个插件
- **THEN** 实例被重建，右侧菜单不再包含该项
- **AND** 播放进度与播放状态被恢复

### Requirement: 文档站接入

文档站 SHALL 在 `/players` 下为简介、七个内置插件、自定义插件与 API 各提供独立页面，每个插件页都带可运行 demo。

#### Scenario: 左侧菜单按插件分页

- **WHEN** 访问 `/players`
- **THEN** 左侧菜单出现「简介」「内置插件」下的七个子项、「扩展」「API」
- **AND** 每个内置插件对应 `/players/<插件>` 一个独立页面

#### Scenario: 页面可访问

- **WHEN** 逐个打开 `/players/*` 页面
- **THEN** 每个插件页展示该插件的说明、配置表、用法与一个只启用该插件的 demo
- **AND** 简介页的 demo 使用 `https://www.w3schools.com/html/mov_bbb.mp4#t=0.1`
- **AND** 插件页的 demo 能播放、右侧菜单里能看到该插件对应的项
