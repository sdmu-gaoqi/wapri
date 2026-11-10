# Spec Delta

## Purpose

为 `@wapri/element-pro` 提供向导式表单容器：把多个独立表单按步骤组织，逐步校验后再前进，最终合并全部字段一次性提交，使业务无需再手写步骤条、步骤切换与跨步数据合并。

## ADDED Requirements

### Requirement: 分步容器与步骤声明

`StepsForm` SHALL 以子组件 `StepsForm.StepForm` 声明步骤，并按声明顺序渲染 `ElSteps`。

#### Scenario: 渲染步骤条

- **WHEN** `<StepsForm>` 内依次声明三个 `StepsForm.StepForm`，`title` 分别为「项目信息」「负责人」「备注」
- **THEN** 步骤条渲染三个步骤，标题与声明顺序一致
- **AND** 当前步骤的高亮状态由 `ElSteps` 的 `active` 驱动

#### Scenario: 只渲染当前步骤的表单

- **WHEN** 当前步骤为第 2 步
- **THEN** 只有第 2 步的表单可见
- **AND** 其余步骤的表单已挂载但不可见，切回时保留已填数据

#### Scenario: 步骤必须有唯一 name

- **WHEN** 两个 `StepsForm.StepForm` 使用相同的 `name`
- **THEN** 组件在开发环境给出警告
- **AND** 以先注册的步骤为准

### Requirement: 每步独立的数据模型

每个 `StepsForm.StepForm` SHALL 拥有独立的 `model`，字段值只在所属步骤内读写。

#### Scenario: 同名 name 不跨步覆盖

- **WHEN** 第 1 步与第 2 步都声明了 `name="remark"` 的字段
- **THEN** 两个字段各自读写自己步骤的值
- **AND** 修改其中一个不影响另一个

#### Scenario: 步骤初始值

- **WHEN** `StepsForm.StepForm` 传入 `initial-values="{ projectName: '青禾' }"`
- **THEN** 该步骤挂载时把初始值写入自己的 `model`
- **AND** 不影响其他步骤

### Requirement: 逐步校验与导航

`StepsForm` SHALL 在前进到下一步前校验当前步骤，校验失败时不切换步骤。

#### Scenario: 当前步校验通过后前进

- **WHEN** 点击「下一步」且当前步骤的字段全部通过校验
- **THEN** `current` 增加 1
- **AND** 触发 `currentChange` 事件

#### Scenario: 当前步校验失败

- **WHEN** 点击「下一步」且当前步骤存在校验失败的字段
- **THEN** `current` 保持不变
- **AND** 当前步骤展示对应的错误信息

#### Scenario: 返回上一步不校验

- **WHEN** 点击「上一步」
- **THEN** `current` 减少 1
- **AND** 不触发任何校验

#### Scenario: 只校验当前步骤

- **WHEN** 第 1 步校验失败、第 2 步全部合法，此时位于第 2 步并点击「下一步」
- **THEN** 只校验第 2 步，第 1 步的错误不影响前进

### Requirement: 提交与数据合并

`StepsForm` SHALL 在最后一步提交时合并全部步骤的字段值，并把合并结果传给 `onFinish`。

#### Scenario: 合并全部步骤的值

- **WHEN** 最后一步点击「提交」且当前步骤校验通过
- **THEN** `onFinish` 收到各步骤字段合并后的对象
- **AND** 同名键以后声明的步骤为准

#### Scenario: onFinish 返回 false

- **WHEN** `onFinish` 返回 `false`
- **THEN** 不重置表单，也不回到第一步
- **AND** `current` 保持在最后一步

#### Scenario: onFinish 正常返回

- **WHEN** `onFinish` 返回 `true` 或 `undefined`
- **THEN** 全部步骤重置为初始值
- **AND** `current` 回到第 1 步

#### Scenario: 最后一步校验失败

- **WHEN** 最后一步存在校验失败的字段时点击「提交」
- **THEN** 不触发 `onFinish`
- **AND** 展示对应的错误信息

### Requirement: 步骤条直接切换

`StepsForm` SHALL 在 `allowStepSelect` 为 `true` 时允许点击步骤条切换步骤，且不触发校验。

#### Scenario: 点击步骤切换

- **WHEN** `allow-step-select` 为 `true` 且点击第 3 步
- **THEN** `current` 直接变为 2（从 0 开始计数）
- **AND** 不触发任何校验

#### Scenario: 默认不允许点击

- **WHEN** 未设置 `allow-step-select` 且点击步骤条
- **THEN** `current` 保持不变

### Requirement: 操作按钮配置

`StepsForm` SHALL 通过 `submitter` 配置操作按钮的文案与显隐。

#### Scenario: 默认按钮

- **WHEN** 未传 `submitter`
- **THEN** 第 1 步只展示「下一步」，中间步骤展示「上一步」「下一步」，最后一步展示「上一步」「提交」

#### Scenario: 自定义文案

- **WHEN** `submitter` 传入 `{ previousText: '返回', nextText: '继续', submitText: '完成' }`
- **THEN** 三个按钮分别展示对应文案

#### Scenario: 隐藏按钮

- **WHEN** `submitter` 为 `false`
- **THEN** 不渲染任何内置按钮
- **AND** 仍可通过实例方法 `next`、`prev`、`submit` 控制流程

### Requirement: 实例方法

`StepsForm` SHALL 暴露命令式方法供业务控制流程与读取数据。

#### Scenario: 读取全部字段

- **WHEN** 调用 `getAllFieldsValue()`
- **THEN** 返回各步骤字段合并后的对象
- **AND** 不触发校验

#### Scenario: 获取指定步骤的表单实例

- **WHEN** 调用 `getFormInstance('owner')`
- **THEN** 返回该步骤 `ProForm` 的实例，可调用 `validate`、`resetFields` 等方法

#### Scenario: 重置全部步骤

- **WHEN** 调用 `resetFields()`
- **THEN** 每个步骤恢复到各自的初始值
- **AND** 清除全部校验状态

### Requirement: 文档与发布

`StepsForm` SHALL 提供 dumi 文档页与可运行示例，并通过 changeset 以次版本号发布。

#### Scenario: 文档页可访问

- **WHEN** 执行 `pnpm dev` 并访问 `/element-pros/steps-form`
- **THEN** 渲染 `packages/element-pro/src/StepsForm/index.md`
- **AND** 页面包含基础用法、纵向步骤与点击切换三个可运行示例

#### Scenario: 版本记录

- **WHEN** 查看本变更新增的 `.changeset/*.md`
- **THEN** 其中包含 `"@wapri/element-pro": minor`
- **AND** 摘要说明新增分步表单
