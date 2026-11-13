# Spec Delta

## Purpose

为 `@wapri/element-pro` 提供素材选择弹窗：左侧分组、右侧素材网格，内置搜索、排序、分页，支持新建分组与裁剪上传，并把选中的素材记录回传给调用方。列表能力完全复用 `ProTable`，因此 `request` 与 ProTable 同签名。

## ADDED Requirements

### Requirement: 素材列表复用 ProTable 的 request 契约

`FileModal` SHALL 把 `request` 直接交给内部 `ProTable`，不改变 `RequestFn` 的签名与 `RequestResult` 的结构。

#### Scenario: request 收到分页与业务参数

- **WHEN** 调用方传入 `request`，并把 `columns` 设为 `6`
- **THEN** 内部列表以 6 列网格渲染素材卡片
- **AND** `request` 的第一参数包含 `current`、`pageSize`、`keyword`、`sortBy`、`groupId`
- **AND** 返回值按 `{ data, total }` 解析

#### Scenario: 空数据

- **WHEN** `request` 返回 `data: []`
- **THEN** 列表区域展示 `emptyText` 文案
- **AND** 不渲染任何素材卡片

### Requirement: 分组切换

`FileModal` SHALL 在左侧渲染「全部」与调用方传入的分组，切换分组后按新 `groupId` 重新请求第一页。

#### Scenario: 切到某个分组

- **WHEN** 用户点击名为「商品主图」的分组
- **THEN** 该分组项进入选中态
- **AND** 下一次 `request` 的 `groupId` 为 `'g-1'`
- **AND** 列表回到第一页

#### Scenario: 回到全部

- **WHEN** 用户在已选中分组的状态下点击「全部」
- **THEN** 下一次 `request` 不带 `groupId`
- **AND** 列表回到第一页

#### Scenario: 分组本地搜索

- **WHEN** 用户在分组搜索框输入「主图」
- **THEN** 分组列表只保留名称包含「主图」的项
- **AND** 右侧素材列表不因此重新请求

### Requirement: 关键词搜索与排序

`FileModal` SHALL 提供素材名称搜索框与排序下拉，两者变化后重新请求第一页。

#### Scenario: 搜索防抖

- **WHEN** 用户在搜索框连续输入三个字符
- **THEN** 300ms 内的中间输入不发起请求
- **AND** 停止输入后只发起一次请求，`keyword` 为最终输入值

#### Scenario: 请求串行

- **WHEN** 前一次 `request` 尚未返回时又触发了新的请求
- **THEN** 两次请求不并发发出，后一次排在前一次之后执行
- **AND** 最终展示的结果由最后一次请求决定

#### Scenario: 切换排序

- **WHEN** 用户把排序从「最新上传」改成「文件从大到小」
- **THEN** 下一次 `request` 的 `sortBy` 为 `'size'`
- **AND** 列表回到第一页

#### Scenario: 重新打开清空搜索

- **WHEN** 用户用关键词筛选后关闭弹窗，再次打开
- **THEN** 搜索框为空
- **AND** 列表按未筛选状态请求

### Requirement: 弹窗加载态

`FileModal` SHALL 在列表请求进行中或分组创建进行中给弹窗内容加 loading 遮罩，并阻止一切点击。

#### Scenario: 请求中禁止操作

- **WHEN** 列表请求尚未返回
- **THEN** 弹窗内容区展示 loading 遮罩
- **AND** 关闭图标、底部「取消」「确定」按钮均不可点击
- **AND** 按 ESC 不关闭弹窗

#### Scenario: 请求结束后恢复

- **WHEN** 请求返回
- **THEN** 遮罩消失，按钮恢复可点击

#### Scenario: 关闭后销毁内容

- **WHEN** 用户关闭弹窗后再次打开
- **THEN** 上一轮的列表数据、分页位置与搜索状态不保留
- **AND** 重新发起一次请求

### Requirement: 新建分组

`FileModal` SHALL 通过外部传入的 `createGroup` promise 新建分组，并在成功后把返回记录插入分组列表并选中。

#### Scenario: 新建成功

- **WHEN** 用户在「添加分组」弹层输入名称「活动素材」、选择颜色并点击确定
- **THEN** 调用 `createGroup({ name: '活动素材', color: '#409eff' })`
- **AND** resolve 后该分组出现在左侧列表并成为当前分组
- **AND** 素材列表按新分组重新请求

#### Scenario: 名称必填且有长度上限

- **WHEN** 名称输入框为空
- **THEN** 「确定」按钮不可点击
- **AND** 名称输入长度不超过 10 个字符

#### Scenario: 新建失败

- **WHEN** `createGroup` reject
- **THEN** 弹层保持打开、保留已填内容
- **AND** 以错误提示展示 reject 的 message
- **AND** 分组列表不变
- **AND** 创建期间弹窗内容区展示 loading 遮罩且不可点击

#### Scenario: 未提供 createGroup

- **WHEN** 调用方不传 `createGroup`
- **THEN** 不渲染「添加分组」按钮

### Requirement: 裁剪上传

`FileModal` SHALL 提供裁剪上传入口，裁剪确认后调用外部 `upload(file, { groupId })`。

#### Scenario: 上传成功

- **WHEN** 用户选择图片、在裁剪弹窗中确认
- **THEN** 调用 `upload` 并带上当前分组 id
- **AND** resolve 返回的素材被自动选中
- **AND** 列表刷新回第一页

#### Scenario: 默认按图片自身比例裁剪

- **WHEN** 调用方不传 `cropperRatios`
- **THEN** 裁剪弹窗只提供「自定义」一项
- **AND** 裁剪框按所选图片自身的宽高比生成
- **AND** 默认选中「自定义」

#### Scenario: 限制可选比例区间

- **WHEN** 调用方传 `cropperRatios: [9 / 16]`
- **THEN** 裁剪弹窗只提供 9:16 一项，不出现「自定义」
- **AND** 按钮文案按比例自动生成为「9:16」

#### Scenario: 多比例并存

- **WHEN** 调用方传 `cropperRatios: [9 / 16, 16 / 9]` 与 `cropperRatioLabels: ['竖版', '横版']`
- **THEN** 裁剪弹窗提供两个按钮，文案为「竖版」「横版」
- **AND** 默认选中第一项

#### Scenario: 自定义与固定比例并存

- **WHEN** 调用方传 `cropperRatios: [0, 1]`
- **THEN** 裁剪弹窗提供「自定义」与「1:1」两项
- **AND** 「自定义」按所选图片自身宽高比裁剪

#### Scenario: 上传失败

- **WHEN** `upload` reject
- **THEN** 以错误提示展示 reject 的 message
- **AND** 不改变当前选中项

#### Scenario: 未提供 upload

- **WHEN** 调用方不传 `upload`
- **THEN** 不渲染「上传素材」按钮

### Requirement: 选中与确认

`FileModal` SHALL 在列表模式下自行维护选中态，并在确认时回传完整素材记录。

#### Scenario: 单选

- **WHEN** `multiple` 为 `false`（默认），用户点击素材 B（此前选中的是 A）
- **THEN** A 取消选中，B 选中
- **AND** `update:selected` 为 `[B.id]`

#### Scenario: 多选

- **WHEN** `multiple` 为 `true`，用户依次点击 A、B
- **THEN** 两项同时处于选中态
- **AND** 再次点击 A 时只取消 A

#### Scenario: 跨页选择后确认

- **WHEN** 用户在第 1 页选中 A，翻到第 2 页选中 B，点击确定
- **THEN** `confirm` 按选中顺序回传 `[A, B]` 两条完整记录
- **AND** 弹窗关闭

#### Scenario: 无选中时不能确认

- **WHEN** 当前没有任何选中项
- **THEN** 「确定」按钮不可点击

#### Scenario: 关闭即取消

- **WHEN** 用户点击弹窗右上角关闭图标
- **THEN** 触发 `cancel`
- **AND** 不触发 `confirm`

### Requirement: 内置预览

`FileModal` SHALL 在图片与视频素材卡片上提供**唯一一个**预览入口，并由组件自己完成预览展示，不需要业务接入。

#### Scenario: 预览图片

- **WHEN** 用户点击某张图片卡片上的预览按钮
- **THEN** 组件用图片查看器展示该素材的预览地址
- **AND** 不改变该素材的选中状态

#### Scenario: 预览视频

- **WHEN** 素材的 `type` 为 `video/*`，或 `url` / `name` 的扩展名属于视频
- **THEN** 卡片只渲染一个预览按钮，不再额外渲染播放角标之类的第二个图标入口
- **AND** 点击后组件用弹窗内的播放器展示该素材

#### Scenario: 预览地址取 previewUrl

- **WHEN** 素材传入了 `previewUrl`
- **THEN** 点击预览展示的是 `previewUrl`
- **AND** 未传或为空时退回 `url`

#### Scenario: 卡片预览图取 abbreviateUrl

- **WHEN** 素材是图片或视频，且传入了 `abbreviateUrl`
- **THEN** 卡片的预览图使用 `abbreviateUrl`
- **AND** 图片未传或为空时退回 `url`
- **AND** 视频用 `<video preload="metadata">` 播放预览地址首帧，`abbreviateUrl` 作为 `poster` 封面

#### Scenario: 卡片名称与操作区

- **WHEN** 素材卡片渲染完成
- **THEN** 名称以黑底半透明白字叠在缩略图底部
- **AND** 选中角标与预览按钮排在缩略图右上角
- **AND** 体积与上传时间展示在缩略图下方

#### Scenario: 预览入口不依赖类型识别

- **WHEN** 素材有预览地址（`previewUrl` 或 `url`），但类型识别不出是图片还是视频
- **THEN** 卡片仍然展示预览按钮
- **AND** 点击后按图片查看器展示

#### Scenario: 不支持的类型不展示入口

- **WHEN** 素材既没有 `previewUrl` 也没有 `url`
- **THEN** 卡片不渲染预览按钮
- **AND** 业务仍可通过 `confirm` 拿到该记录自行处理

#### Scenario: 类型判断优先 MIME

- **WHEN** 素材的 `type` 为 `image/png` 但 `url` 是 `.mp4`
- **THEN** 按 `image` 处理
- **AND** MIME 缺失时依次按 `url` / `previewUrl` / `abbreviateUrl` / `name` 的扩展名兜底
- **AND** `data:` 开头的地址按前缀判断

### Requirement: 分组与上传能力可选

`FileModal` SHALL 根据 `createGroup` 与 `upload` 是否传入决定对应按钮的显隐，未传入时不渲染入口。

#### Scenario: 只读挑选

- **WHEN** 调用方只传 `request` 与 `groups`，不传 `createGroup`、`upload`
- **THEN** 弹窗只提供分组切换、搜索、排序、分页与选中
- **AND** 不出现任何写操作入口
