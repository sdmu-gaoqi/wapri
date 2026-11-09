# pro-form-fields Specification

## Purpose

为 `@wapri/element-pro` 提供一组开箱即用的表单字段组件，把 `ElFormItem` 与 Element Plus 输入控件组合成单一组件，统一承担值绑定、校验、只读展示、枚举选项生成与栅格布局，使业务表单无需重复拼装 `ElFormItem` 与控件。

## Requirements

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
