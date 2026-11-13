# Spec Delta

## Purpose

为 `@wapri/element-pro` 提供数据驱动的文件卡片列表，把缩略图展示、图片 / 视频 / 文档预览、删除、拖动排序统一成一个组件，业务只需要维护一份 `FileListItem[]`。

## ADDED Requirements

### Requirement: 数据与回写

`FileList` SHALL 接收 `FileListItem[]`，并在删除、排序后同时回写 `update:data` 与对应事件。

#### Scenario: 渲染传入数据

- **WHEN** 传入 `data` 包含若干 `{ name, abbreviateUrl, previewUrl }`
- **THEN** 按数组顺序渲染卡片
- **AND** 卡片缩略图取 `abbreviateUrl`，名称为 `name`

#### Scenario: 受控回写

- **WHEN** 用户删除或拖动排序
- **THEN** 抛出 `update:data`，携带变更后的完整数组
- **AND** 同时抛出 `remove(item, index)` 或 `sort(data, oldIndex, newIndex)`

#### Scenario: 额外字段保留

- **WHEN** 业务项通过索引签名携带 `id`、`size` 等字段
- **THEN** 排序与删除后的新数组保留这些字段
- **AND** 不修改原始数组对象

### Requirement: 卡片列表

`FileList` SHALL 以网格卡片展示缩略图和名称，并按配置控制删除与拖拽。

#### Scenario: 网格列数

- **WHEN** 设置 `columns` 为 4
- **THEN** 每行最多显示 4 张卡片
- **AND** 窄屏（≤640px）自动降为 2 列

#### Scenario: 缩略图降级

- **WHEN** `abbreviateUrl` 加载失败
- **THEN** 卡片显示文件图标占位
- **AND** 名称仍正常展示

#### Scenario: 文档占位图标

- **WHEN** 文档项未传 `abbreviateUrl`
- **THEN** 卡片按扩展名或 MIME 展示 PDF、Excel、Word、PPT 等对应图标
- **AND** 图标里显示扩展名短文案

#### Scenario: 名称浮层与操作区

- **WHEN** 卡片渲染完成
- **THEN** 名称以黑底半透明白字叠在缩略图底部
- **AND** 长名称单行省略，且不拦截卡片点击
- **AND** 预览 / 删除按钮排在缩略图右上角

#### Scenario: 视频卡片首帧

- **WHEN** 列表项被识别为视频
- **THEN** 卡片用 `<video preload="metadata">` 展示 `previewUrl` 的首帧
- **AND** `abbreviateUrl` 作为 `poster` 封面；与视频地址相同时不重复设置
- **WHEN** 首帧加载失败
- **THEN** 退回 `abbreviateUrl` 封面
- **WHEN** 封面也加载失败
- **THEN** 卡片显示文件图标占位

#### Scenario: 操作按钮

- **WHEN** `previewable` 为 `true`
- **THEN** 点击卡片或预览按钮打开预览
- **WHEN** `removable` 为 `true`
- **THEN** 点击删除按钮触发删除，且不打开预览

#### Scenario: 只读

- **WHEN** `removable` 为 `false` 且 `sortable` 为 `false`
- **THEN** 不显示删除按钮、不注册拖拽

### Requirement: 预览分流

`FileList` SHALL 按媒体类型选择预览方式：图片用 `ElImageViewer`，视频用 `ElDialog` + `<video>`，其他用 `ElDialog` + `@wapri/preview`。

#### Scenario: 图片左右切换

- **WHEN** 列表中包含图片、视频、文档并点击某张图片
- **THEN** 打开 `ElImageViewer`
- **AND** `urlList` 只包含图片项，按列表顺序排列，并定位到当前图片
- **AND** 可左右切换其它图片

#### Scenario: 视频播放

- **WHEN** 点击视频项
- **THEN** 打开 `ElDialog`，内部 `<video controls autoplay>` 播放 `previewUrl`

#### Scenario: 文档预览

- **WHEN** 点击 PDF / Word / XLSX / 文本项
- **THEN** 打开 `ElDialog`
- **AND** 动态加载 `@wapri/preview` 并在容器内渲染
- **WHEN** 关闭弹窗
- **THEN** 调用预览句柄的 `destroy()` 释放资源

#### Scenario: 预览失败

- **WHEN** 文档预览加载或解析失败
- **THEN** 弹窗内展示错误提示
- **AND** 抛出 `error`

### Requirement: 拖动排序

`FileList` SHALL 在 `sortable` 为 `true` 时支持卡片拖动排序，并复用 `@vue-dnd-kit/core`。

#### Scenario: 顺序变化

- **WHEN** 用户把第 3 张拖到第 1 张之前
- **THEN** 卡片顺序立即更新
- **AND** 抛出 `sort(data, 2, 0)` 与 `update:data`

#### Scenario: 拖出取消

- **WHEN** 拖到列表外释放
- **THEN** 顺序保持原样
- **AND** 不抛出 `sort`

#### Scenario: 键盘排序

- **WHEN** 键盘聚焦卡片后按空格再按方向键移动
- **THEN** 与指针拖动一致地更新顺序
