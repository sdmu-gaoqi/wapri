# Spec Delta

## Purpose

为 `@wapri/element-pro` 提供一组开箱即用的表单字段组件，把 `ElFormItem` 与 Element Plus 输入控件组合成单一组件，统一承担值绑定、校验、只读展示、枚举选项生成与栅格布局，使业务表单无需重复拼装 `ElFormItem` 与控件。

## ADDED Requirements

### Requirement: 字段组件与 valueType 的对应关系

`@wapri/element-pro` SHALL 提供一组字段组件，每个组件对应 `ProTable` 既有 `ValueType` 中的一个值，不引入第二套类型词汇。

#### Scenario: 按 valueType 选择组件

- **WHEN** 业务需要录入 `valueType` 为 `select` 的字段
- **THEN** 使用 `ProFormSelect`，其底层控件为 `ElSelect`
- **AND** `text`、`textarea`、`password`、`digit`、`money`、`tag`、`treeSelect`、`cascader`、`date`、`dateRange`、`time`、`timeRange`、`switch` 分别对应 `ProFormText`、`ProFormTextArea`、`ProFormText.Password`、`ProFormDigit`、`ProFormMoney`、`ProFormTag`、`ProFormTreeSelect`、`ProFormCascader`、`ProFormDatePicker`、`ProFormDateRangePicker`、`ProFormDateTimePicker`、`ProFormDateTimeRangePicker`、`ProFormSwitch`

#### Scenario: time 表示日期时间

- **WHEN** 使用 `ProFormDateTimePicker`
- **THEN** 底层为 `ElDatePicker` 且 `type` 为 `datetime`
- **AND** 与 `ProTable` 中 `valueType: 'time'` 的查询控件保持一致

#### Scenario: customer 不提供组件

- **WHEN** 业务需要完全自定义的字段控件
- **THEN** 直接用 `ElFormItem` 包裹自有控件，与字段组件混用
- **AND** 组件库不提供 `ProFormCustomer`

### Requirement: 通过 name 读写表单模型

字段组件 SHALL 通过 `name` 读写所属 `ElForm` 的 `model`，`name` 同时作为 `ElFormItem` 的 `prop`。

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

### Requirement: 校验由 ElFormItem 承担

字段组件 SHALL 把 `rules`、`required` 与 `prop` 交给 `ElFormItem`，使 `formRef.validate()` 覆盖全部字段。

#### Scenario: 必填校验

- **WHEN** `<ProFormText name="username" :rules="[{ required: true, message: '请输入用户名' }]" />` 的值为空时调用 `formRef.validate()`
- **THEN** 校验失败，`ElFormItem` 展示错误信息
- **AND** 标签前展示必填星号

#### Scenario: 校验失败阻止提交

- **WHEN** 字段校验未通过时调用 `ModalForm` 的 `submit()`
- **THEN** 不触发 `finish` 事件
- **AND** 弹层保持打开

#### Scenario: 表单级 rules 生效

- **WHEN** `ElForm` 通过 `:rules` 声明了 `name` 对应字段的规则
- **THEN** 该规则对字段组件生效
- **AND** 与组件自身 `rules` 合并校验

### Requirement: 只读渲染

字段组件 SHALL 在 `readonly` 为 `true` 时渲染纯文本而非禁用控件，文本格式与 `ProTable` 单元格展示规则一致。

#### Scenario: 枚举值显示文本

- **WHEN** `ProFormSelect` 设置 `readonly` 且配置了 `valueEnum`
- **THEN** 展示枚举对应的文本，不渲染下拉框
- **AND** 未命中枚举时展示原始值

#### Scenario: 区间值拼接

- **WHEN** `ProFormDateRangePicker` 设置 `readonly` 且值为两个日期
- **THEN** 两个日期用 ` ~ ` 连接展示

#### Scenario: 空值占位

- **WHEN** 只读字段的值为 `undefined`、`null` 或空字符串
- **THEN** 展示 `-`
- **AND** 可通过 `emptyText` 覆盖占位文案

### Requirement: 枚举与选项生成

字段组件 SHALL 支持 `valueEnum` 与 `options` 两种方式生成子项，`valueEnum` 的解析规则与 `ProTable` 一致。

#### Scenario: valueEnum 生成下拉项

- **WHEN** `ProFormSelect` 传入 `valueEnum: { open: '未解决', closed: '已解决' }`
- **THEN** 渲染两个选项，文本为“未解决”“已解决”
- **AND** 选中值分别为 `open`、`closed`

#### Scenario: 树形枚举

- **WHEN** `ProFormTreeSelect` 或 `ProFormCascader` 的 `valueEnum` 项包含 `children`
- **THEN** 按层级渲染节点
- **AND** `disabled` 逐项生效

#### Scenario: options 优先于 valueEnum

- **WHEN** 同时传入 `options` 与 `valueEnum`
- **THEN** 使用 `options`
- **AND** `valueEnum` 仅用于只读文本渲染

### Requirement: 字段宽度与栅格布局

字段组件 SHALL 支持 `width` 与 `colProps` 控制自身占位，`colProps` 透传给外层 `ElCol`。

#### Scenario: 预设宽度

- **WHEN** `width` 传入 `'xs'`、`'sm'`、`'md'`、`'lg'` 或 `'xl'`
- **THEN** 控件宽度分别为 `104px`、`216px`、`328px`、`440px`、`552px`
- **AND** `width` 传入数字时按像素生效

#### Scenario: 栅格占位

- **WHEN** `colProps` 传入 `{ span: 12 }`
- **THEN** 字段在 `ElRow` 中占据 12 栅格
- **AND** 未传 `colProps` 时字段占满一行

### Requirement: 占位文案与属性透传

字段组件 SHALL 支持在组件上直接设置 `placeholder`，并把 `fieldProps` 透传给底层控件。

#### Scenario: placeholder 直接透传

- **WHEN** `<ProFormText name="username" placeholder="请输入用户名" />`
- **THEN** 输入框展示该占位文案
- **AND** 无需写入 `fieldProps`

#### Scenario: fieldProps 优先级

- **WHEN** 组件上设置 `placeholder` 且 `fieldProps` 也设置 `placeholder`
- **THEN** `fieldProps` 的值生效
- **AND** 其余 `fieldProps` 字段原样透传给底层控件

#### Scenario: formItemProps 透传

- **WHEN** `formItemProps` 传入 `{ labelWidth: 120 }`
- **THEN** 该属性透传给 `ElFormItem`
- **AND** 不影响底层控件属性

### Requirement: 字段级共享能力上移

`ProTable` 的字段级类型与工具函数 SHALL 从共享模块导出，`ProTable` 的公开导出面保持不变。

#### Scenario: 既有导入路径继续可用

- **WHEN** 业务从 `@wapri/element-pro` 导入 `ValueType`、`ValueEnum`、`ValueEnumItem`
- **THEN** 类型定义与本次变更前一致
- **AND** 不需要修改业务代码

#### Scenario: 字段组件与表格共用同一套格式化

- **WHEN** 同一个 `valueEnum` 同时用于 `ProFormSelect` 的只读展示与 `ProTable` 的单元格展示
- **THEN** 两处展示的文本完全一致
- **AND** 枚举解析只有一份实现

### Requirement: 文档与发布

字段组件集 SHALL 提供 dumi 文档页与可运行示例，并通过 changeset 以次版本号发布。

#### Scenario: 文档页可访问

- **WHEN** 执行 `pnpm dev` 并访问 `/element-pros/pro-form-fields`
- **THEN** 渲染 `packages/element-pro/src/ProFormFields/index.md`
- **AND** 页面包含基础用法、只读展示与栅格布局三个可运行示例

#### Scenario: 文档页名称与组件名区分

- **WHEN** 阅读文档页标题
- **THEN** 标题为“ProFormFields 表单项”
- **AND** 正文说明 `ProFormFields` 是文档页名称，实际使用的是一个组件集合

#### Scenario: 版本记录

- **WHEN** 查看本变更新增的 `.changeset/*.md`
- **THEN** 其中包含 `"@wapri/element-pro": minor`
- **AND** 摘要说明新增表单字段组件集
