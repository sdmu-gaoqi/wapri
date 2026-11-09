---
'@wapri/element-pro': minor
---

新增 `ProForm`、`ProFormList`、`ProFormDependency` 三个表单容器组件，各自独立成页。

`ProForm` 是 `ElForm` 的薄封装：绑定 `model` 与 `rules`，统一 `labelWidth`，并把 `readonly` 向下传递给所有字段组件。字段组件不再需要手写 `ElForm` 包裹。

`ProFormList` 承载可增删的重复行，行内字段用相对名书写，容器自动把 `name` 拼成 `['<列表名>', '<行下标>', ...]`，值读写与 `ElFormItem.prop` 共用同一路径，因此 `formRef.validate()` 与 `resetFields()` 按行唯一；支持数组级 `rules`、`initialValue` 深拷贝、复制与移动行、`max` / `min` 行数限制、空态与只读继承。

`ProFormDependency` 按 `names` 订阅表单 `model` 的字段子集，通过作用域插槽把值交给模板，支持点分路径与 `ProFormList` 行内前缀；隐藏不清值。

字段组件新增路径前缀能力：在 `ProFormList` 行内时 `name` 是相对当前行的路径，不在列表内时行为与之前完全一致。

`ModalForm` / `DrawerForm` 内部改用 `ProForm` 承载字段，新增 `readonly` 与 `labelWidth` 两个 props；示例与文档改用字段组件。
