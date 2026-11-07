---
'@wapri/element-pro': minor
---

新增表单字段组件集 `ProFormFields`：`ProFormText`、`ProFormTextArea`、`ProFormText.Password`、`ProFormDigit`、`ProFormMoney`、`ProFormSelect`、`ProFormTag`、`ProFormTreeSelect`、`ProFormCascader`、`ProFormDatePicker`、`ProFormDateRangePicker`、`ProFormDateTimePicker`、`ProFormDateTimeRangePicker`、`ProFormSwitch`。

字段组件通过 `name` 直接读写 `ElForm` 的 `model`，`rules` / `required` / `formRef.validate()` 走 Element Plus 原生校验链路；支持 `valueEnum` / `options` 生成选项、`readonly` 文本渲染、`width` 与 `colProps` 布局。

`ValueType`、`ValueEnum`、`ValueEnumItem`、`getValueEnumOptions`、`toTreeOptions`、`findEnumPath`、`formatCellValue` 上移到 `shared/field`，`ProTable` 改为 re-export，导出面与行为不变。
