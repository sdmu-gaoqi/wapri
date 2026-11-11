---
title: ProTable
group:
  title: 组件
  order: 1
---

# ProTable

Vue 3 版本的高级数据表格，基于 [Element Plus](https://element-plus.org/zh-CN/) 实现，使用一份 `columns` 配置同时描述查询表单和表格列，API 语义参考 [pro-components ProTable](https://procomponents.ant.design/components/table)。

依赖要求：`vue >= 3.3`、`element-plus >= 2.4`（需在使用方项目中引入 Element Plus 及其样式）。

## 基础用法

包含 tabs 状态筛选、查询表单、行选择、工具栏与分页的完整示例。

<code src="./demo/basic.vue" title="基础用法"></code>

## valueType 全量演示

一份配置覆盖全部 `valueType` 的查询控件与表格渲染：`text`、`textarea`、`password`、`digit`、`money`、`select`、`tag`、`treeSelect`、`cascader`、`date`、`dateRange`、`time`、`timeRange`、`switch`、`customer`。

<code src="./demo/value-types.vue" title="valueType 全量演示"></code>

## customer 自定义搜索

`valueType: 'customer'` 配合 `renderFormItem` 自定义搜索控件，下面示例使用 `ElSelect` 渲染区域筛选项。

<code src="./demo/customer.vue" title="customer 自定义搜索"></code>

## slot 说明

<code src="./demo/slot.vue" title="slot 说明"></code>

## 表格 / 列表切换

通过 `modes` 配置可用展示模式。模式数组的第一项为初始模式；配置多个模式时，数据区顶部会显示切换按钮组，配置单个模式时不显示按钮。列表模式由组件内置网格容器，使用 `listProps.columns` 配置列数、`listProps.gap` 配置间距，通过 `itemRender` 插槽自定义每一项内容；空数据时 `empty` 插槽会跨满全部网格列。`selectModeBefore` 和 `selectModeAfter` 分别渲染在切换按钮组前后。

需要把模式切换放到自己的工具栏里时，用 `mode` + `v-model:mode` 受控当前模式，内部按钮组仍会保留（可按需隐藏），两侧状态保持一致。

```vue | pure
<ProTable v-model:mode="mode" :modes="['table', 'list']" :columns="columns" :request="request" />
```

<code src="./demo/modes.vue" title="表格 / 列表切换"></code>

ProTable 支持以下布局插槽：

- `tabSub`：Tab 与查询表单之间的内容。
- `searchActionLeft`：查询、重置按钮左侧的自定义操作。只要提供任一搜索操作插槽，即使查询和重置按钮都隐藏，操作区域仍会显示。
- `searchActionRight`：查询、重置按钮右侧的自定义操作。
- `tableInfo`：渲染在 `ProTableToolbar` 与表格 `section` 之间的内容。
- `tableTitle`：查询相关区域（包括收起状态搜索操作栏左侧的已筛选条件、选中操作和错误提示）与表格之间的内容。
- `selectModeBefore` / `selectModeAfter`：数据区顶部模式按钮组前后的内容；插槽参数包含 `mode`、`modes`、`dataSource` 和 `action`。
- `itemRender`：`mode` 为 `list` 时渲染每个列表项；插槽参数包含 `item`、`record`、`index`、`dataSource`、`mode` 和 `action`。

插槽的渲染顺序如下：工具栏 → `tableInfo` → `tabSub` → 查询表单字段（收起时隐藏）→ 搜索操作行（收起时左侧为已筛选条件，右侧为 `searchActionLeft`、查询按钮、重置按钮、`searchActionRight`）→ 选中操作/错误提示 → `tableTitle` → `selectModeBefore`、模式按钮、`selectModeAfter` → 表格或列表。

```vue | pure
<template>
  <ProTable :columns="columns" :request="request" :tabs="tabs" :modes="['table', 'list']">
    <template #tabSub>
      <div>Tab 下方的补充内容</div>
    </template>
    <template #searchActionLeft>
      <ElButton>左侧操作</ElButton>
    </template>
    <template #searchActionRight>
      <ElButton>右侧操作</ElButton>
    </template>
    <template #tableInfo>
      <div>工具栏与表格区域之间的补充信息</div>
    </template>
    <template #tableTitle>
      <div>表格上方的标题或提示</div>
    </template>
    <template #selectModeBefore="{ dataSource }">
      <span>共 {{ dataSource.length }} 条</span>
    </template>
    <template #selectModeAfter>
      <ElButton>筛选</ElButton>
    </template>
    <template #itemRender="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </ProTable>
</template>
```

## 核心 API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` | `ProColumn<T>[]` | `[]` | 列配置。支持 `title`、`dataIndex`、`valueType`、`valueEnum`、`render`、`renderText`、`renderFormItem`、`search`、`hideInTable`、`hideInForm`、`width`、`fixed`、`ellipsis`、`sorter`、`filters`、`initialValue`、`fieldProps`、`proFieldProps` 及各组件 props。详见下方“columns 与 valueType”。 |
| `request` | `(params, sort, filter, context) => Promise<RequestResult<T>>` | - | 异步数据请求。自动首次请求时，表格从首帧开始展示加载态，不会短暂展示空状态。返回 `{ data, success?, total? }`；`success: false` 会按空数据处理。请求抛错时 ProTable 会自动清空表格数据和分页总数，并触发 `onRequestError`。`params` 自动包含 `current`、`pageSize`、`tabActiveKey`、`params` 和搜索表单值，`context` 可区分日期快捷选择和手动选择。 |
| `dataSource` | `T[]` | `[]` | 静态数据源。未配置 `request` 时使用，后续变化会同步到表格。配置 `request` 时由请求结果驱动表格数据。 |
| `defaultData` | `T[]` | `[]` | 初始数据，仅用于初始化表格；未配置 `request` 且未传 `dataSource` 时也会作为静态数据源。 |
| `params` | `U` | `{}` | 额外请求参数；对象变化后自动回到第一页并刷新。 |
| `tabs` | `ProTableTabItem[]` | `[]` | 顶部状态筛选 Tab。每项包含 `key`、`tab`，可选 `count`、`disabled`；配置 `count` 时自动显示数量徽标，激活项会以 `tabActiveKey` 并入请求参数。 |
| `tabMore` | `ProTableTabMoreConfig` | - | 顶部“更多状态”无边框下拉菜单配置，内部使用 `ElDropdown`。`options` 复用 `ProTableTabItem`，可显示更多状态及数量徽标；选择后与普通 Tab 一样触发 `onTabChange` 并刷新数据。 |
| `modes` | `Array<'table' \| 'list'>` | `['table']` | 可用的数据展示模式。第一项为初始模式；包含多个模式时显示模式切换按钮组，只有一个模式时隐藏按钮组。 |
| `mode` | `'table' \| 'list'` | 第一项 `modes` | 受控的展示模式，配合 `v-model:mode` 使用；不传时由组件内部维护。切换到未包含在 `modes` 里的值会被忽略。 |
| `listProps` | `ProTableListProps` | `{ columns: 3, gap: '12px' }` | 列表模式的内置网格配置；`columns` 控制列数，`gap` 控制网格间距。 |
| `tabActiveKey` | `Key` | - | 受控的激活 Tab，变化后自动刷新。与 `defaultTabActiveKey` 同时传入时优先使用此值。 |
| `defaultTabActiveKey` | `Key` | 第一项的 `key` | 非受控模式下的初始激活 Tab。未传时使用 `tabs` 第一项。 |
| `pagination` | `PaginationConfig` 或 `false` | `{}` | 分页配置；设为 `false` 关闭分页。默认当前页为 `1`、每页 `10` 条。 |
| `rowKey` | `string` 或 `(record, index) => Key` | `'id'` | 行唯一键。字符串按记录字段读取；函数可根据记录和索引返回键。未找到有效键时使用行索引。 |
| `rowSelection` | `RowSelectionConfig<T>` 或 `false` | - | 传入对象开启行选择；`false` 或不传时关闭。支持初始选中项、选中变化回调和选中操作行。 |
| `search` | `SearchConfig` 或 `false` | `{}` | 查询表单配置；默认开启，设为 `false` 关闭。没有可搜索列时不渲染搜索表单及搜索操作区；搜索字段超过 3 个时自动显示圆形图标展开/收起按钮，收起后隐藏全部搜索字段。 |
| `form` | `ProTableFormConfig` | - | 查询表单的补充配置，可配置 `searchText`、`resetText`、`labelWidth` 和 `filterType`。`search` 中同名配置优先级更高。 |
| `toolBarRender` | `(action, context) => VNodeChild[] \| false` | - | 返回工具栏右侧操作项；返回 `false` 不渲染自定义项。`context` 包含 `selectedRowKeys`、`selectedRows`。也可以使用 `toolbar` 插槽。 |
| `options` | `ProTableOptions` 或 `false` | `{}` | 工具栏操作配置。支持 `reload`：是否显示右侧“刷新”按钮；设为 `false` 可隐藏该按钮。传 `false` 时也会隐藏刷新按钮。详见下方“options”。 |
| `headerTitle` | `VNodeChild` | - | 工具栏左侧主标题。 |
| `headerSubtitle` | `VNodeChild` | - | 主标题下方的副标题。 |
| `headerAlert` | `AlertProps`（来自 Element Plus） | - | 工具栏内渲染自定义 Alert；必须传入 `type` 才显示，支持 `title`、`description`、`closable`、`show-icon` 等 `ElAlert` 属性。Alert 底部默认保留 `12px` 间距。 |
| `download` | `boolean \| string \| VNode` | `false` | 工具栏导出按钮配置。传 `false` 或不传时隐藏；传 `true` 时按钮文案为“导出”；传字符串或 VNode 时作为按钮内容。 |
| `selectedFiltersTitle` | `string` | `'已筛选'` | 已选条件条的前缀文案。 |
| `actionRef` | `ActionRef<T>` | - | 获取刷新、查询表单、树形数据展开/收起等命令式方法。模板场景推荐使用 `ref="actionRef"` 模板引用，见下方 actionRef 章节。 |
| `beforeSearchSubmit` | `(params) => params` | - | 请求提交前转换最终参数；可用于改名、删除或补充搜索字段。 |
| `manualRequest` | `boolean` | `false` | 为 `true` 时不自动发起首次请求，仍可通过 `actionRef.reload()` 手动加载。 |
| `columnEmptyText` | `string` 或 `false` | `'-'` | 单元格为空时的占位文本；设为 `false` 时显示空字符串。 |
| `loading` | `boolean` | `false` | 外部加载状态；为 `true` 时在表格区域显示加载遮罩，可与 `request` 内部加载状态同时使用。 |
| `sticky` | `boolean` 或 `StickyConfig` | `true` | 粘性布局：表格模式下表头随页面滚动吸顶，存在横向溢出时显示底部同步滚动条；列表模式下分页 footer 仍吸底。`true` 等同 `{ offsetHeader: 0, offsetScroll: 0 }`。 |
| `showRequestError` | `boolean` | `false` | 是否在请求失败时展示错误 Alert（`type="error"`，显示 `error.message`）。 |
| `tableProps` | `TableProps`（来自 Element Plus） | - | 透传给底层 `ElTable`，用于补充未单独暴露的表格能力，如 `height`、`border`、`stripe`、`size` 等；也可以传 `onRowClick`、`rowClassName` 等事件与回调。 |
| `onLoad` | `(data: T[]) => void` | - | 请求成功并更新数据后触发。 |
| `onRequestError` | `(error: Error) => void` | - | 请求失败后触发；回调执行前 ProTable 已自动清空表格数据和分页总数。 |
| `onSubmit` | `(params) => void` | - | 搜索提交、请求发起前触发，参数已经过 `beforeSearchSubmit` 转换。 |
| `onReset` | `() => void` | - | 搜索表单重置时触发。 |
| `onFieldChange` | `(fieldKey: string, value: unknown, context: ProTableRequestContext) => void \| Promise<void>` | - | 查询表单字段值发生变化时触发，传入字段键、值和请求上下文；可通过 `context.quickDateSelections` 区分快速日期和手动日期。 |
| `onTabChange` | `(key: Key) => void` | - | Tab 切换时触发。 |
| `onModeChange` | `(mode: 'table' \| 'list') => void` | - | 数据展示模式切换时触发。 |
| `update:mode` | `(mode: 'table' \| 'list') => void` | - | 受控模式下的模式变化事件，配合 `v-model:mode` 使用。 |
| `onDataSourceChange` | `(data: T[]) => void` | - | 表格数据源发生变化后触发，静态数据和请求数据都适用。 |
| `onDownload` | `(params, sort, filter, context) => void \| Promise<void>` | - | 点击工具栏导出按钮时触发，参数与 `request` 一致：包含请求参数、排序、筛选和日期快捷选择上下文。 |

### Tabs 数量徽标与更多状态

`tabs` 中的 `count` 会在 Tab 文案右侧显示数量徽标；`tabMore` 使用无边框 `ElDropdown` 承载不常用的状态，仅展示与 Tab 垂直居中的触发文案和下拉箭头，当前选中的更多状态会显示为主题色。更多状态的选项与普通 Tab 使用相同的 `key`、`tab`、`count` 和 `disabled` 配置，选择后会更新当前 Tab 并重新请求数据。Tabs 与更多下拉菜单所在行使用整行底部边框，Tabs 不会默认拉伸占满剩余空间。

```vue | pure
<ProTable
  :columns="columns"
  :request="request"
  :tabs="[
    { key: 'all', tab: '全部' },
    { key: 'shipping', tab: '待发货', count: 49 },
    { key: 'pickup', tab: '待自提', count: 8 },
    { key: 'exception', tab: '异常', count: 2 },
  ]"
  :tab-more="{
    text: '更多状态',
    options: [
      { key: 'shipped', tab: '已发货' },
      { key: 'completed', tab: '已完成' },
      { key: 'cancelled', tab: '已取消' },
    ],
  }"
  @tab-change="handleTabChange"
/>
```

### options

`options` 只控制工具栏内置操作，目前支持刷新按钮：

| 配置 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `reload` | `boolean` | `true` | 是否显示工具栏右侧的刷新按钮。点击后调用 `actionRef.reload()` 的同等逻辑，刷新当前页。 |

示例：

```vue | pure
<!-- 隐藏内置刷新按钮，但保留自定义工具栏内容和其他表格能力 -->
<template>
  <ProTable
    :columns="columns"
    :request="request"
    :options="{ reload: false }"
  />
</template>
```

如需在自定义按钮中刷新，使用 `toolBarRender` 的第一个参数 `action`：

```ts
const toolBarRender = (action: ActionType) => [
  h(ElButton, { onClick: () => action.reload() }, () => '刷新'),
]
```

### 分页配置

`pagination` 传对象时支持以下字段；传 `false` 可完全关闭分页。

| 配置 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `current` | `number` | `1` | 初始页码。 |
| `pageSize` | `number` | `10` | 初始每页条数。 |
| `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | 每页条数下拉选项。 |
| `showQuickJumper` | `boolean` | `true` | 是否显示快速跳页输入框。 |
| `showTotal` | `boolean` | `true` | 是否显示总条数。 |

### 行选择配置

| 配置 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `selectedRowKeys` | `Key[]` | `[]` | 初始选中的行键；行键由 `rowKey` 决定。 |
| `onChange` | `(keys, rows) => void` | - | 选中行变化时触发，依次收到选中键和选中记录。 |
| `alwaysShowActions` | `boolean` | `false` | 没有选中行时是否仍显示选中操作行。 |

选中行后，ProTable 会在搜索区下方、表格上方显示轻量选中操作行：左侧自动显示已选数量，右侧提供“取消选择”。通过 `selectionActions` 插槽添加批量操作按钮：

```vue | pure
<template>
  <ProTable
    :columns="columns"
    :request="request"
    :row-selection="{}"
  >
    <template #selectionActions="{ selectedRowKeys, selectedRows, clearSelected }">
      <ElButton @click="handleBatchTakeDown(selectedRowKeys, selectedRows)">批量强制下架</ElButton>
      <ElButton type="danger" plain @click="handleBatchBan(selectedRowKeys)">批量封禁</ElButton>
      <ElButton @click="clearSelected">自定义清空</ElButton>
    </template>
  </ProTable>
</template>
```

`selectionActions` 只负责批量操作按钮；`selectedRowKeys`、`selectedRows` 和 `clearSelected` 可直接用于业务逻辑。旧的 `tableAlert` 插槽已移除。

### 搜索配置

没有可搜索列（全部配置了 `hideInForm: true` 或 `search: false`）时，不渲染搜索表单和 `wa-ui-pro-table__search-actions`。搜索字段超过 3 个时自动显示圆形图标展开/收起按钮，默认展示全部搜索字段；收起后隐藏全部搜索字段、移除搜索容器的背景色、边框和内边距，并在搜索操作行左侧展示已筛选条件，展开时不展示已筛选条件。收起状态的搜索操作行顶部对齐；收起且没有筛选条件时隐藏内置查询、重置按钮，将操作行压缩为右侧的展开图标，同时保留自定义搜索操作插槽。存在表格/列表切换且收起状态没有筛选条件时，展开图标移动到模式切换行。已筛选文案与标签列表分开布局，标签换行后仍从标签区域的起始位置对齐。

| 配置 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `searchText` | `string` | `'查询'` | 查询按钮文案；传空字符串 `''` 时隐藏查询按钮。 |
| `resetText` | `string` | `'重置'` | 重置按钮文案；传空字符串 `''` 时隐藏重置按钮。 |
| `labelWidth` | `number \| 'auto'` | - | 搜索表单统一标签宽度；单列的 `fieldProps.labelWidth` 可覆盖它。 |

## columns 与 valueType

`fixed` 用于固定列，支持 `true`（固定到左侧）、`'left'` 或 `'right'`。固定列建议同时配置 `width`，并配合横向滚动使用。固定列会自动使用表格行底色，并与普通列保持一致；`stripe`、悬浮和当前行状态仍沿用 Element Plus 的颜色规则。

使用 `tableProps.rowClassName` 为业务状态行设置背景时，应在行类上设置 `--el-table-tr-bg-color`（例如 `.pending-row { --el-table-tr-bg-color: #fdf6ec; }`），或通过 `tableProps.rowStyle` 设置行背景。避免仅对 `.pending-row td` 设置底色：固定单元格继承的是 `tr` 的背景，无法继承其他单元格的背景。

默认背景继承规则在悬浮、当前行和斑马纹状态下不参与覆盖；固定列与普通列统一使用 Element Plus 对应状态色，移出鼠标后恢复行底色。

```ts
const columns: ProColumn<Employee>[] = [
  { title: '姓名', dataIndex: 'name', valueType: 'text', fixed: 'left', width: 120 },
  {
    title: '部门',
    dataIndex: 'dept',
    valueType: 'treeSelect',
    valueEnum: [
      {
        text: '技术中心',
        value: 'tech',
        children: [
          { text: '前端组', value: 'frontend' },
          { text: '后端组', value: 'backend' },
        ],
      },
    ],
  },
  {
    title: '常驻地区',
    dataIndex: 'region',
    valueType: 'cascader',
    valueEnum: [
      {
        text: '广东',
        value: 'guangdong',
        children: [{ text: '深圳', value: 'shenzhen' }],
      },
    ],
  },
  { title: '月薪', dataIndex: 'salary', valueType: 'money' },
  { title: '入职日期', dataIndex: 'hireDate', valueType: 'date' },
]
```

`valueType` 决定查询表单的控件与表格的默认渲染：

| valueType | 查询控件 | 表格渲染 |
| --- | --- | --- |
| `text` | el-input | 原始文本 |
| `textarea` | el-input(textarea) | 原始文本 |
| `password` | el-input(password) | 原始文本（建议配合 `renderText` 脱敏） |
| `digit` | el-input-number | 数值 |
| `money` | el-input | `¥xx.xx` 金额格式 |
| `select` | el-select | valueEnum 文本 |
| `tag` | 标签选择器 | valueEnum 文本 |
| `treeSelect` | el-tree-select | valueEnum 文本（深层值拼接父级路径） |
| `cascader` | el-cascader | 路径文本，用 ` ~ ` 连接 |
| `date` | el-date-picker(date) | 日期文本 |
| `dateRange` | el-date-picker(daterange) | 起止日期，用 ` ~ ` 连接 |
| `time` | el-date-picker(datetime) | 日期时间文本 |
| `timeRange` | el-date-picker(datetimerange) | 起止日期时间，用 ` ~ ` 连接 |
| `switch` | el-switch | valueEnum 文本，未配置时显示 是/否 |
| `customer` | `renderFormItem` 自定义内容 | 按普通值处理 |

`valueEnum` 同时驱动下拉/树/级联选项与表格文本展示；`treeSelect` 与 `cascader` 通过 `children` 声明层级。单元格渲染优先级：具名插槽 > `render` > `renderText` > `valueType` 默认渲染 > 原始值。

各内置搜索控件支持列级 props 透传，组件专属 props 优先于通用 `fieldProps`：

```ts
const columns: ProColumn<Employee>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    valueType: 'text',
    inputProps: { maxlength: 20, showWordLimit: true },
  },
  {
    title: '年龄',
    dataIndex: 'age',
    valueType: 'digit',
    inputNumberProps: { min: 0, max: 150, precision: 0 },
  },
  {
    title: '部门',
    dataIndex: 'dept',
    valueType: 'treeSelect',
    treeSelectProps: { filterable: true },
  },
]
```

`inputProps`、`inputNumberProps`、`selectProps`、`treeSelectProps`、`cascaderProps`、`datePickerProps` 和 `switchProps` 分别透传给对应的 Element Plus 控件；`datePickerProps` 同样适用于 `time` / `timeRange`，最终分别使用 `datetime` / `datetimerange` 类型。`tag` 的选项由 `valueEnum` 提供，可通过 `tagProps` 配置。`formItemProps`、`colProps` 和 `columnProps` 分别透传给搜索表单项、搜索栅格和表格列。`fieldProps` 仍可用于兼容通用控件属性，并继续支持 `col`、`labelWidth`。

`time` 和 `timeRange` 默认使用 `valueFormat: 'YYYY-MM-DD HH:mm:ss'`，分别输出日期时间字符串和日期时间字符串数组；`timeRange` 手动选择日期时默认使用开始 `00:00:00`、结束 `23:59:59`，可通过 `datePickerProps.defaultTime` 覆盖。也可通过 `datePickerProps` 覆盖 `format`、`valueFormat`、`dateFormat`、`timeFormat`、`arrowControl`、`disabledDate`、`disabledHours`、`disabledMinutes`、`disabledSeconds`、`startPlaceholder`、`endPlaceholder`、`rangeSeparator` 等 `ElDatePicker` 属性。

默认选中快捷项时，直接将与快捷项完全一致的值传给列的 `initialValue`。例如 `timeRange` 的“今天”应传当天 `00:00:00` 到 `23:59:59`；范围值必须使用列的 `datePickerProps.valueFormat`（未配置时日期范围为 `YYYY-MM-DD`，日期时间范围为 `YYYY-MM-DD HH:mm:ss`）。

`tag` 选择器和已开启 `dateQuickSelect` 的搜索项默认占满一行；可通过 `colProps.span` 或 `fieldProps.col.span` 覆盖。`date`、`dateRange`、`time`、`timeRange` 的快捷选择默认关闭；设置 `dateQuickSelect: true` 或传入配置对象后开启。默认展示今天；范围类型另有近 7 天、近 30 天。昨天默认不展示，可通过 `dateQuickSelect.showYesterday` 开启。快捷项与自定义日期选择互斥：点击快捷项会清空日期控件，手动选择日期会取消快捷项。日期和日期时间是单值选择器，因此只展示昨天、今天；范围选择器才展示“近 n 天”。快捷项的范围值为当天 00:00:00 至 23:59:59（日期格式会自然省略时间）。

标签和日期快捷选择器已抽为 element-pro 独立组件：从 `@wapri/element-pro` 导入 `TagSelector`、`DateQuickSelect`。两个组件都使用 `v-model`；日期组件在点击快捷项时额外触发 `quick-select`，回调参数为 `{ key, label, value }`。完整用法和 API 请见 [TagSelector](/element-pros/tag-selector) 与 [DateQuickSelect](/element-pros/date-quick-select)。

```ts
const columns: ProColumn<Employee>[] = [
  {
    title: '处理状态',
    dataIndex: 'status',
    valueType: 'tag',
    valueEnum: { pending: '待处理', success: '处理成功', failed: '处理失败' },
    tagProps: { multiple: false, allText: '全部' },
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'timeRange',
    dateQuickSelect: { showYesterday: true, recentDays: [3, 7, 30] },
  },
]
```

透传优先级为“组件专属 props > `fieldProps`”。搜索值由 ProTable 统一维护，因此 `modelValue`、`onUpdate:modelValue` 和 `valueType` 对应的 `type` 不建议在列 props 中设置；`treeSelectProps.data` / `cascaderProps.options` 显式传入时优先使用，否则由 `valueEnum` 生成。其余 Element Plus 属性和事件均可直接传入。

### 列字段说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 表头标题，同时作为搜索表单标签和默认输入框提示文案的一部分。 |
| `dataIndex` | `string \| string[]` | 数据字段。传数组时按对象嵌套路径读取，例如 `['user', 'name']`。 |
| `valueEnum` | `ValueEnum` | 为 `select`、`treeSelect`、`cascader` 提供选项，并将单元格中的值格式化为对应文本。对象写法的 key 是值，数组写法的每项包含 `text` 和 `value`；树形选项使用 `children`。 |
| `render` | `(value, record, index) => VNodeChild` | 自定义单元格渲染，优先级高于 `renderText` 和默认渲染。 |
| `renderText` | `(value, record, index) => unknown` | 先转换单元格值，再使用组件的空值和枚举格式化逻辑；适合脱敏、单位拼接等场景。 |
| `renderFormItem` | `(value, column, setValue) => VNodeChild` | `valueType: 'customer'` 时自定义搜索控件。`value` 是当前值，调用 `setValue` 更新搜索值；可返回任意 Vue/Element Plus VNode。自定义控件如需在表格或已选条件中显示中文名称，应同时配置 `valueEnum`。 |
| `search` | `boolean` | 是否出现在搜索表单中，默认为 `true`；设为 `false` 只隐藏搜索字段，不影响表格列。 |
| `hideInTable` | `boolean` | 是否隐藏表格列。默认为 `false`。 |
| `hideInForm` | `boolean` | 是否隐藏搜索表单字段。默认为 `false`。 |
| `width` | `number \| string` | 表格列宽。固定列建议同时设置。 |
| `fixed` | `boolean \| 'left' \| 'right'` | 固定列位置；`true` 等同固定到左侧。 |
| `ellipsis` | `boolean` | 为 `true` 时内容溢出显示省略提示。 |
| `sorter` | `boolean \| (left, right) => number` | 为 `true` 时启用远程排序事件；传函数时作为本地比较函数类型声明，当前请求模式仍通过 `sort` 参数交给业务处理。 |
| `filters` | `boolean \| { text, value }[]` | 筛选项类型声明；当前版本不会自动渲染筛选菜单，筛选条件可通过搜索表单或 `request` 参数自行处理。 |
| `initialValue` | `unknown` | 搜索字段初始值；重置搜索时会恢复该值。日期字段开启 `dateQuickSelect` 时，如果初始值与快捷项值完全一致（如今天、近 7 天），首次渲染和重置后会同步高亮对应快捷项。 |
| `fieldProps` | `Record<string, unknown>` | 搜索控件的通用补充配置，会透传给当前搜索控件；`col` 透传给 `ElCol`（默认 `span: 8`），`labelWidth` 控制当前字段标签宽度（默认 `72px`），`requestNow` 设为 `true` 时字段变化立即提交查询，默认 `false`。组件专属 props 优先于此配置。 |
| `formItemProps` | `FormItemProps` | 透传给当前搜索项的 `ElFormItem`。 |
| `colProps` | `ColProps` | 透传给当前搜索项的 `ElCol`，优先级高于 `fieldProps.col`。 |
| `columnProps` | `TableColumnProps` | 透传给表格中的 `ElTableColumn`，可配置 `align`、`headerAlign`、`minWidth`、`resizable` 等属性。 |
| `inputProps` | `InputProps` | `text`、`textarea`、`password`、`money` 类型透传给 `ElInput`；也兼容通过 `fieldProps` 传入的通用组件属性。 |
| `inputNumberProps` | `InputNumberProps` | `digit` 类型透传给 `ElInputNumber`。 |
| `selectProps` | `SelectProps` | `select` 类型透传给 `ElSelect`。 |
| `tagProps` | `TagSelectorProps` | `tag` 类型配置；搜索项默认占满一行，默认单选并展示“全部”清空项，可设置 `multiple`、`showAll`、`allText`。 |
| `treeSelectProps` | `SelectProps` | `treeSelect` 类型透传给 `ElTreeSelect`。 |
| `cascaderProps` | `CascaderProps` | `cascader` 类型透传给 `ElCascader`。 |
| `datePickerProps` | `DatePickerProps` | `date`、`dateRange`、`time`、`timeRange` 类型透传给 `ElDatePicker`；`time` / `timeRange` 会固定为 `datetime` / `datetimerange`，并提供默认 `valueFormat: 'YYYY-MM-DD HH:mm:ss'`，传入的 `valueFormat` 优先。 |
| `dateQuickSelect` | `boolean \| DateQuickSelectConfig` | 日期快捷项配置，默认关闭；开启后搜索项默认占满一行，且与自定义日期选择互斥。支持 `showYesterday`（默认 `false`）、`showToday`（默认 `true`）和范围选择器的 `recentDays`（默认 `[7, 30]`）。 |
| `switchProps` | `SwitchProps` | `switch` 类型透传给 `ElSwitch`。 |

自定义搜索控件示例：

```ts
  {
    title: '工作模式',
    dataIndex: 'workMode',
    valueType: 'customer',
    valueEnum: { onsite: '现场办公', remote: '远程办公', hybrid: '混合办公' },
    renderFormItem: (value, _column, setValue) =>
    h(ElSelect, {
      modelValue: typeof value === 'string' ? value : undefined,
      clearable: true,
      'onUpdate:modelValue': setValue,
    }, () => [
      h(ElOption, { label: '现场办公', value: 'onsite' }),
      h(ElOption, { label: '远程办公', value: 'remote' }),
    ]),
}
```

## request

```ts
const request: RequestFn<Employee, { dept?: string }> = async (params, sort, filter, context) => {
  const isQuickToday = context.quickDateSelections.createdAt?.key === 'today'
  const response = await fetchEmployees({
    dept: params.dept,
    tabActiveKey: params.tabActiveKey,
    page: params.current,
    pageSize: params.pageSize,
    sort,
    filter,
  })
  // 根据 isQuickToday 分支处理业务逻辑
  return { data: response.items, total: response.total, success: true }
}
```

查询提交会把 `params`、`tabActiveKey`、表单值、分页、排序和筛选合并后传给 `request`；`beforeSearchSubmit` 可用于提交前转换参数。`request` 的第四个参数 `context.quickDateSelections` 仅包含通过日期快捷项选中的字段：快速选择“今天”时对应字段的 `key` 为 `today`；手动选择同样的日期时，该字段不会出现在此对象中。

## actionRef

获取 `reload`、`reloadAndRest`、`reset`、`clearSelected`、`setPageInfo` 等命令式方法。**模板场景推荐使用 Vue 模板引用**，调用方式与 prop 完全一致：

```vue | pure
<script setup lang="ts">
import { ref } from 'vue'
import { ProTable, type ActionType } from '@wapri/element-pro'

const actionRef = ref<ActionType>()
</script>

<template>
  <ProTable ref="actionRef" :columns="columns" :request="request" />
</template>
```

```ts
actionRef.value?.reload(true) // 刷新并回到第一页
actionRef.value?.reloadAndRest() // 重置查询并刷新
actionRef.value?.reset() // 重置查询表单
actionRef.value?.clearSelected() // 清空选中行
actionRef.value?.setPageInfo({ pageSize: 20 })
actionRef.value?.toggleRowExpansion(menu, true) // 展开指定树形数据行；省略第二个参数时切换状态
actionRef.value?.expandAll() // 展开当前已加载树形数据的全部父级节点
actionRef.value?.collapseAll() // 收起当前已加载树形数据的全部父级节点
actionRef.value?.formRef.setFieldsValue({ status: 'active' }) // 设置查询字段
void actionRef.value?.formRef.submit() // 提交当前表单并刷新
void actionRef.value?.formRef.resetFields() // 重置表单并刷新
```

`formRef` 支持 `getFieldsValue`、`getFieldValue`、`setFieldsValue`、`setFieldValue`、`submit` 和 `resetFields`。设置字段值不会自动发起请求，需要调用 `formRef.submit()` 提交；如果设置的值匹配已开启的日期快捷项（如今天或近 7 天），对应快捷项也会同步选中。连续快速提交时每次都会发起请求，最终以最后一次请求结果为准。

树形数据通过 `tableProps.treeProps` 启用后，可使用 `toggleRowExpansion(row, expanded?)` 控制单行，或使用 `expandAll()` / `collapseAll()` 批量控制当前已加载的父级节点。批量操作读取 `tableProps.treeProps.children`，未配置时使用默认字段 `children`；懒加载但尚未加载子节点的数据行请使用 `toggleRowExpansion` 单独控制。

> ⚠️ 注意：`action-ref` 是普通 prop，SFC 模板里 `:action-ref="actionRef"` 会被 Vue 自动解包成 `actionRef.value`（初始为 `undefined`），无法把 ref 本体传进来。因此模板中请使用 `ref="actionRef"`。
>
> 在 JSX / JS 作用域传参时，`action-ref` prop 才真正生效：可直接传 Vue ref 对象，也可传 `{ current }` 容器对象，组件会通过 watch 写入并正确处理替换与卸载清理。
>
> ```ts
> // JSX：actionRef={actionRef}（Vue ref 对象）
> // 模板 + 容器对象：
> const actionRef = { current: undefined as ActionType | undefined }
> actionRef.current?.reload(true)
> ```

## 插槽

- `headerTitle`：替换左侧主标题。
- `headerSubtitle`：替换主标题下方的副标题。
- `toolbar`：替换工具栏右侧操作。
- `tabSub`：渲染在 Tab 与查询表单之间。
- `searchActionLeft`：渲染在查询、重置按钮左侧；提供任一搜索操作插槽时，搜索操作区域会保留。
- `searchActionRight`：渲染在查询、重置按钮右侧。
- `tableInfo`：渲染在 `ProTableToolbar` 与表格 `section` 之间。
- `tableTitle`：渲染在查询相关区域与表格之间。
- `selectionActions`：自定义选中行批量操作按钮，显示在搜索区下方、表格上方的操作行中，可获得 `selectedRowKeys`、`selectedRows` 和 `clearSelected`；操作行左侧会自动显示已选数量，右侧提供“取消选择”。
- `empty`：自定义空数据内容。
- `dataIndex` 对应的具名插槽：自定义单元格，可获得 `value`、`record` 和 `index`。

## 兼容边界

当前版本聚焦查询型列表，不包含 `editable`、`columnsState`、`polling`、全屏和列级远程枚举等增强能力。公共类型和渲染优先级已为后续扩展保留空间。
