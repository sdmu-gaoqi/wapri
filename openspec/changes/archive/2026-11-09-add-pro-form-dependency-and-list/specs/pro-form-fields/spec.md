# Spec Delta

## ADDED Requirements

### Requirement: 表单容器

`@wapri/element-pro` SHALL 提供 `ProForm`，作为 `ElForm` 的薄封装承载字段组件，绑定 `model` 与 `rules`，并把表单级 `readonly` 向下传递给所有字段。

#### Scenario: 字段组件无需手写 ElForm

- **WHEN** 在 `<ProForm :model="model">` 内使用 `<ProFormText name="username" />`
- **THEN** 输入内容写入 `model.username`
- **AND** 业务代码中不出现 `ElForm`

#### Scenario: 表单级只读向下传递

- **WHEN** `ProForm` 设置 `readonly`
- **THEN** 其内所有字段组件渲染为纯文本
- **AND** 字段显式传 `readonly: false` 时以字段为准

#### Scenario: 表单级规则合并

- **WHEN** `ProForm` 通过 `rules` 声明了某字段的规则，且字段自身也传了 `rules`
- **THEN** 两处规则合并生效
- **AND** `formRef.validate()` 覆盖全部字段

#### Scenario: 暴露表单方法

- **WHEN** 通过 `ref<ProFormAction>()` 获取 `ProForm` 实例
- **THEN** 可调用 `validate`、`validateField`、`resetFields`、`clearValidate`、`scrollToField`
- **AND** `formRef` 返回底层 `ElForm` 实例

### Requirement: 字段联动

`@wapri/element-pro` SHALL 提供 `ProFormDependency`，按 `names` 订阅表单 `model` 的字段子集，并通过作用域插槽把当前值交给模板。

#### Scenario: 按依赖值条件渲染

- **WHEN** `<ProFormDependency :names="['type']" v-slot="{ type }">` 内放置 `<ProFormText v-if="type === 'custom'" name="customName" />`
- **THEN** `model.type` 为 `custom` 时渲染该字段
- **AND** 其他取值时不渲染

#### Scenario: 订阅多个字段

- **WHEN** `names` 传入 `['province', 'city']`
- **THEN** 插槽参数同时包含 `province` 与 `city` 两个键
- **AND** 任一字段变化都会更新插槽参数

#### Scenario: 未命中的字段返回 undefined

- **WHEN** `names` 中的字段在 `model` 中不存在
- **THEN** 插槽参数中该键的值为 `undefined`
- **AND** 不抛出运行时错误

#### Scenario: 隐藏不清值

- **WHEN** 依赖值变化导致插槽内的字段不再渲染
- **THEN** 该字段在 `model` 中的既有值保持不变
- **AND** 组件不主动清空或重置该值

#### Scenario: 支持嵌套路径

- **WHEN** `names` 传入 `['profile.level']`
- **THEN** 插槽参数中的 `profile.level` 键取值为 `model.profile.level`

### Requirement: 数组字段

`@wapri/element-pro` SHALL 提供 `ProFormList`，以数组字段承载可增删的重复行，行内字段使用相对名书写。

#### Scenario: 行内字段写入对应下标

- **WHEN** `<ProFormList name="users">` 内放置 `<ProFormText name="name" />`，且列表有 3 行
- **THEN** 第 2 行的输入写入 `model.users[1].name`
- **AND** 各行互不影响

#### Scenario: 新增与删除行

- **WHEN** 点击新增按钮
- **THEN** 在数组末尾追加一行，行内字段取 `initialValue` 或空值
- **AND** 点击某行的删除按钮后，该行从数组移除，其余行下标前移且值跟随行移动

#### Scenario: 行内校验按行唯一

- **WHEN** 列表有 3 行且行内字段声明了 `required` 规则
- **THEN** `formRef.validate()` 逐行校验，任一行为空即校验失败
- **AND** 错误信息展示在对应行的字段下方

#### Scenario: 数组级校验

- **WHEN** `ProFormList` 传入 `rules: [{ type: 'array', min: 1, message: '至少一行' }]` 且数组为空
- **THEN** `formRef.validate()` 校验失败
- **AND** 列表下方展示该错误信息

#### Scenario: 行内字段继承只读

- **WHEN** `ProFormList` 设置 `readonly`
- **THEN** 行内字段渲染为只读文本
- **AND** 新增、删除、复制、移动操作不可用

#### Scenario: 空态

- **WHEN** 数组为空且未设置 `emptyText`
- **THEN** 展示默认空态文案
- **AND** 可通过 `emptyText` 覆盖，传 `false` 时不展示空态

#### Scenario: 复制与移动行

- **WHEN** 点击某行的复制按钮
- **THEN** 在该行之后插入一份深拷贝，两行值互不共享引用
- **AND** 点击上移或下移按钮时该行与相邻行交换位置，值跟随行移动

### Requirement: 字段路径前缀

字段组件 SHALL 在 `ProFormList` 行内把自身 `name` 解析为「列表路径 + 行下标 + 自身路径」，并让 `ElFormItem` 的 `prop` 使用同一路径。

#### Scenario: 前缀参与值读写

- **WHEN** 在 `<ProFormList name="users">` 的第 1 行内使用 `<ProFormText name="profile.nickname" />`
- **THEN** 值读写落在 `model.users[0].profile.nickname`

#### Scenario: 前缀参与校验注册

- **WHEN** 行内字段声明了 `prop` 与 `rules`
- **THEN** `ElFormItem` 的 `prop` 为 `['users', '0', 'profile', 'nickname']` 形式的数组
- **AND** 根表单的 `resetFields()` 能按行定位到该字段

#### Scenario: 不在列表内时行为不变

- **WHEN** 字段组件不在任何 `ProFormList` 内使用
- **THEN** 路径解析结果与未引入前缀前一致
- **AND** 既有业务代码无需修改

#### Scenario: 列表嵌套

- **WHEN** `ProFormList` 内再嵌套一层 `ProFormList`
- **THEN** 内层行内字段的路径包含两层下标
- **AND** 各层下标互不覆盖

## MODIFIED Requirements

### Requirement: 通过 name 读写表单模型

字段组件 SHALL 通过 `name` 读写所属 `ElForm` 的 `model`，`name` 同时作为 `ElFormItem` 的 `prop`；在 `ProFormList` 行内时，`name` 是相对当前行的路径。

#### Scenario: 双向绑定表单模型

- **WHEN** 在 `<ElForm :model="model">` 内使用 `<ProFormText name="username" />`
- **THEN** 输入内容写入 `model.username`
- **AND** 外部修改 `model.username` 时输入框同步更新

#### Scenario: 支持嵌套路径

- **WHEN** `name` 传入 `'profile.nickname'`
- **THEN** 值读写落在 `model.profile.nickname`
- **AND** 与 `ElFormItem` 的 `prop` 路径语义一致

#### Scenario: 缺少表单上下文

- **WHEN** 字段组件不在 `ElForm` 内使用，或 `ElForm` 未传 `model`
- **THEN** 组件仍渲染控件与标签，但不读写任何模型值
- **AND** 不抛出运行时错误

### Requirement: 文档与发布

字段组件集与三个表单容器 SHALL 各自提供 dumi 文档页与可运行示例，并通过 changeset 以次版本号发布。

#### Scenario: 文档页可访问

- **WHEN** 执行 `pnpm dev` 并访问 `/element-pros/pro-form-fields`
- **THEN** 渲染 `packages/element-pro/src/ProFormFields/index.md`
- **AND** 页面包含基础用法、只读展示与栅格布局三个可运行示例

#### Scenario: 容器各自独立成页

- **WHEN** 访问 `/element-pros/pro-form`、`/element-pros/pro-form-list`、`/element-pros/pro-form-dependency`
- **THEN** 分别渲染 `ProForm/index.md`、`ProFormList/index.md`、`ProFormDependency/index.md`
- **AND** 每页都有可运行示例

#### Scenario: 文档页名称与组件名区分

- **WHEN** 阅读 `ProFormFields` 文档页标题
- **THEN** 标题为“ProFormFields 表单项”
- **AND** 正文说明 `ProFormFields` 是文档页名称，实际使用的是一个组件集合

#### Scenario: 容器示例使用字段组件

- **WHEN** 查看 `ModalForm` 与 `DrawerForm` 的文档页与示例
- **THEN** 示例使用 `ProFormText` 等字段组件而非 `ElFormItem` 包裹 `ElInput`
- **AND** 文档正文说明默认插槽放置字段组件

#### Scenario: 版本记录

- **WHEN** 查看本变更新增的 `.changeset/*.md`
- **THEN** 其中包含 `"@wapri/element-pro": minor`
- **AND** 摘要说明新增表单容器、字段联动与数组字段能力
