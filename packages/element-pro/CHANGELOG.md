# @wapri/element-pro

## 3.7.0

### Minor Changes

- 0fc1082: 新增 `DragSortTable` 拖拽排序表格（`dragSortKey` / `dragSortHandlerRender` / `onDragSortEnd`，API 对齐 pro-components），`CropperUpload` 新增 `sortable` 支持上传列表拖拽排序，`ProTable` 的 `ActionType` 新增 `setDataSource`。拖拽底座为 `@vue-dnd-kit/core`，需要 `vue >= 3.5`。

## 3.6.0

### Minor Changes

- FileModal 新增 `accept` prop：上传按钮按文件大类校验，图片仍走裁剪流程，视频等非图片素材选完直接上传

## 3.5.3

### Patch Changes

- FileModal的分组支持了编辑与表格列表模式切换

## 3.5.2

### Patch Changes

- 修复了问题,素材选择无法预览的问题

## 3.5.1

### Patch Changes

- 为 FileModal 添加内置预览功能，支持图片和视频的预览展示

## 3.5.0

### Minor Changes

- a5c5c04: 新增 `FileModal` 素材选择弹窗（复用 ProTable 列表模式，支持分组、搜索、排序、分页、新建分组与裁剪上传），并为 `CropperUpload` 增加 `ratioLabels` 以覆盖比例按钮文案。
- a5c5c04: TabForm 新增垂直 tab：`tabPosition` 支持 `left` / `right`，`navWidth` 控制导航列宽度，导航项左对齐并自动换行，底部按钮随导航列让位。

## 3.4.0

### Minor Changes

- 573266a: 新增分步表单 `StepsForm`：用 `<StepsForm>` 包住若干 `<StepsForm.StepForm>`，每步一个独立表单，点「下一步」先校验当前步，最后一步把所有步骤的字段合并后交给 `onFinish`。

  支持 `v-model:current`、`stepsProps` 透传、`allowStepSelect` 点击切换、`submitter` 按钮配置，以及 `next` / `prev` / `submit` / `resetFields` / `getAllFieldsValue` / `getFormInstance` 实例方法。

- c775508: 新增多 tab 表单 `TabForm`：用 `<TabForm>` 包住若干 `<TabForm.Item>`，所有 tab 共用一份 `model`，可自由切换；提交时校验全部 tab，失败自动跳到第一个出错的分段并在标题上显示红点。

  支持 `v-model:active`、`tabsProps` 透传、`submitter` 按钮配置，以及 `submit` / `resetFields` / `getFormInstance` / `getInvalidTabs` 实例方法。

## 3.3.1

### Patch Changes

- 修复 `ProForm` 合并 `formProps` 时，显式 props 的默认值把 `formProps` 同名配置顶掉的问题。

  3.3.0 里 `formPropsOf` 把两组值一次性展开后过滤 `undefined`，导致：
  - `formProps.disabled` 被 `disabled: undefined` 覆盖后被删掉，`ElForm` 收不到禁用；
  - `formProps.inline`、`formProps.showMessage`、`formProps.hideRequiredAsterisk`、`formProps.scrollToError` 被 Boolean 默认值 `false` 覆盖，永远不生效；
  - `ModalForm` / `DrawerForm` 的 `formProps.labelWidth` 被同名 `labelWidth` 的 `undefined` 覆盖。

  改为 `formProps` 打底、显式 props 只在有值时覆盖，并给上述 Boolean props 补 `default: undefined`。显式 prop 仍然优先。

## 3.3.0

### Minor Changes

- 9b5795e: 新增 `ProForm`、`ProFormList`、`ProFormDependency` 三个表单容器组件，各自独立成页。

  `ProForm` 是 `ElForm` 的薄封装：绑定 `model` 与 `rules`，统一 `labelWidth`，并把 `readonly` 向下传递给所有字段组件。字段组件不再需要手写 `ElForm` 包裹。

  `ProFormList` 承载可增删的重复行，行内字段用相对名书写，容器自动把 `name` 拼成 `['<列表名>', '<行下标>', ...]`，值读写与 `ElFormItem.prop` 共用同一路径，因此 `formRef.validate()` 与 `resetFields()` 按行唯一；支持数组级 `rules`、`initialValue` 深拷贝、复制与移动行、`max` / `min` 行数限制、空态与只读继承。

  `ProFormDependency` 按 `names` 订阅表单 `model` 的字段子集，通过作用域插槽把值交给模板，支持点分路径与 `ProFormList` 行内前缀；隐藏不清值。

  字段组件新增路径前缀能力：在 `ProFormList` 行内时 `name` 是相对当前行的路径，不在列表内时行为与之前完全一致。

  `ModalForm` / `DrawerForm` 内部改用 `ProForm` 承载字段，新增 `readonly` 与 `labelWidth` 两个 props；示例与文档改用字段组件。

- 86bdffe: 新增表单字段组件集 `ProFormFields`：`ProFormText`、`ProFormTextArea`、`ProFormText.Password`、`ProFormDigit`、`ProFormMoney`、`ProFormSelect`、`ProFormTag`、`ProFormTreeSelect`、`ProFormCascader`、`ProFormDatePicker`、`ProFormDateRangePicker`、`ProFormDateTimePicker`、`ProFormDateTimeRangePicker`、`ProFormSwitch`。

  字段组件通过 `name` 直接读写 `ElForm` 的 `model`，`rules` / `required` / `formRef.validate()` 走 Element Plus 原生校验链路；支持 `valueEnum` / `options` 生成选项、`readonly` 文本渲染、`width` 与 `colProps` 布局。

  `ValueType`、`ValueEnum`、`ValueEnumItem`、`getValueEnumOptions`、`toTreeOptions`、`findEnumPath`、`formatCellValue` 上移到 `shared/field`，`ProTable` 改为 re-export，导出面与行为不变。

## 3.2.0

### Minor Changes

- 82960ab: 新增 `UmdComponent`：按需从 CDN 加载 UMD 脚本并渲染其中的组件，支持 React UMD（`createRoot` / `render`）与 Vue UMD，附带 `loading`、`error` 插槽与 `reload()` 实例方法。

## 3.1.0

### Minor Changes

- 新增了预览库

### Patch Changes

- Updated dependencies
  - @wapri/ghooks@1.1.0
  - @wapri/gutils@2.1.0

## 3.0.1

### Patch Changes

- 修改readme
- Updated dependencies
  - @wapri/ghooks@1.0.1
  - @wapri/gutils@2.0.1

## 3.0.0

### Major Changes

- e698455: 图标能力调整，图标组件改为通用命名并移除内置图标源：
  - `MaiIcon` 重命名为 `SvgIcon`，class 前缀改为 `${prefix}-svg-icon`；`MaiIconProps` → `SvgIconProps`。
  - `MaiUISize` 重命名为 `ElementProSize`，`MaiUIConfigContext` 重命名为 `ElementProConfigContext`。
  - 删除内置的 `MAI_ICONFONT_URL`：图标集地址改由 `SvgIcon` 的 `src` 或 `ConfigProvider` 的 `iconfont` 注入，库内不再请求任何第三方图标地址。
  - 迁移：`import { MaiIcon } from '@wapri/element-pro'` → `import { SvgIcon } from '@wapri/element-pro'`；使用图标前通过 `ConfigProvider :iconfont="https://你的图标集.js"` 指定图标源。

- 调整了包的整体结构

### Patch Changes

- Updated dependencies
  - @wapri/ghooks@1.0.0
  - @wapri/gutils@2.0.0
