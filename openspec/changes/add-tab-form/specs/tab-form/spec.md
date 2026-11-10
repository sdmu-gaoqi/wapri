# Spec Delta

## Purpose

为 `@wapri/element-pro` 提供多 tab 表单容器：多个 tab 共用一份数据模型，用户可自由切换，提交时一次性校验全部 tab 并自动定位到第一个出错的 tab，使「一个实体拆多页编辑」无需再手写 tab 导航、表单收集与错误跳转。

## ADDED Requirements

### Requirement: 多 tab 容器与分段声明

`TabForm` SHALL 以子组件 `TabForm.Item` 声明分段，并按声明顺序渲染 `ElTabs`。

#### Scenario: 渲染 tab 导航

- **WHEN** `<TabForm>` 内依次声明三个 `TabForm.Item`，`title` 分别为「基础信息」「价格库存」「配送设置」
- **THEN** tab 导航渲染三个标签，文案与声明顺序一致
- **AND** 默认激活第一个 tab

#### Scenario: 分段必须有唯一 name

- **WHEN** 两个 `TabForm.Item` 使用相同的 `name`
- **THEN** 组件给出警告
- **AND** 以先注册的分段为准

#### Scenario: 未访问过的 tab 也已挂载

- **WHEN** 用户从未点击过第三个 tab
- **THEN** 第三个 tab 内的字段已经挂载
- **AND** 提交时这些字段参与校验

### Requirement: 共享数据模型

`TabForm` SHALL 让所有分段共用调用方传入的 `model`，字段值在任意 tab 内读写同一对象。

#### Scenario: 跨 tab 读取同一字段

- **WHEN** 第 1 个 tab 修改了 `productType`，第 2 个 tab 内使用 `ProFormDependency` 依赖该字段
- **THEN** 第 2 个 tab 立即读到新值
- **AND** 不需要把值提升到父组件

#### Scenario: 提交值就是传入的模型

- **WHEN** 提交成功
- **THEN** `onFinish` 收到的对象包含全部 tab 的字段
- **AND** 该对象是 `model` 的浅拷贝，修改它不影响表单内部状态

#### Scenario: 同名 name 互相覆盖

- **WHEN** 两个 tab 声明了同名 `name` 的字段
- **THEN** 两个字段读写同一个值
- **AND** 文档说明分段内字段名应保持唯一

### Requirement: 全量校验与错误定位

`TabForm` SHALL 在提交时校验全部 tab，并在失败时切换到第一个出错的 tab。

#### Scenario: 全部通过后提交

- **WHEN** 点击「提交」且所有 tab 的字段都通过校验
- **THEN** 触发 `onFinish`，参数为合并后的模型
- **AND** 不切换当前 tab

#### Scenario: 校验失败跳到第一个出错的 tab

- **WHEN** 第 1 个与第 3 个 tab 存在校验失败的字段，当前位于第 2 个 tab 时点击「提交」
- **THEN** 当前 tab 切换到第 1 个 tab
- **AND** 不触发 `onFinish`
- **AND** 该 tab 展示对应的错误信息

#### Scenario: 出错 tab 标记

- **WHEN** 提交失败
- **THEN** 出错的 tab 标题上展示错误标记
- **AND** 下一次提交时重新计算标记

#### Scenario: onFinish 返回 false

- **WHEN** `onFinish` 返回 `false`
- **THEN** 不重置表单
- **AND** 当前 tab 保持不变

### Requirement: tab 切换不校验

`TabForm` SHALL 允许用户自由切换 tab，切换时不触发任何校验。

#### Scenario: 切换到未填写的 tab

- **WHEN** 当前 tab 存在校验失败的字段，用户点击另一个 tab
- **THEN** 直接切换，不弹错误、不阻止
- **AND** 原 tab 的错误状态保留

#### Scenario: 受控激活项

- **WHEN** 传入 `active` 并监听 `update:active`
- **THEN** 激活项由外部控制
- **AND** 内部跳转（如提交失败）同样通过该事件通知外部

### Requirement: 实例方法

`TabForm` SHALL 暴露命令式方法供业务控制与读取。

#### Scenario: 获取指定分段的表单实例

- **WHEN** 调用 `getFormInstance('price')`
- **THEN** 返回该分段 `ProForm` 的实例，可调用 `validate`、`resetFields` 等方法

#### Scenario: 重置全部分段

- **WHEN** 调用 `resetFields()`
- **THEN** 每个分段恢复到各自的初始值
- **AND** 清除全部校验状态与错误标记

#### Scenario: 读取出错分段

- **WHEN** 调用 `getInvalidTabs()`
- **THEN** 返回当前存在校验错误的分段 `name` 列表
- **AND** 不触发新的校验

### Requirement: 文档与发布

`TabForm` SHALL 提供 dumi 文档页与可运行示例，并通过 changeset 以次版本号发布。

#### Scenario: 文档页可访问

- **WHEN** 执行 `pnpm dev` 并访问 `/element-pros/tab-form`
- **THEN** 渲染 `packages/element-pro/src/TabForm/index.md`
- **AND** 页面包含基础用法、跨 tab 联动与提交错误跳转三个可运行示例

#### Scenario: 版本记录

- **WHEN** 查看本变更新增的 `.changeset/*.md`
- **THEN** 其中包含 `"@wapri/element-pro": minor`
- **AND** 摘要说明新增多 tab 表单
