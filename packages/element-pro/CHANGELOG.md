# @wapri/element-pro

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
