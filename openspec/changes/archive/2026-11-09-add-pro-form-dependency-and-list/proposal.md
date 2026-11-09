# Proposal

## Why

`ProFormFields` 目前只有平铺的表单项：字段的 `name` 是相对 `ElForm.model` 的绝对路径，没有前缀概念，也没有表单容器。这带来三个真实缺口：

- **容器缺失**：字段组件必须手写 `ElForm` 包裹并自己绑 `model` / `rules`，`readonly` 只能逐个字段传。`ModalForm` / `DrawerForm` 内部各写一份 `ElForm`，与字段组件之间没有统一的只读通道。
- **联动**：字段之间互相依赖（选了「自定义」才出现输入框、选了省份才加载城市）时，业务只能自己 `computed` 整个 `model`，再在模板里写 `v-if`。没有统一的读取入口，也没有「只订阅这几个字段」的能力。
- **数组字段**：明细行、多联系人、多附件这类结构，业务只能手写 `v-for` 并自己拼 `users.${index}.name`。漏一个 `${index}` 就静默写错行，且 `ElFormItem.prop` 拼错时校验与 `resetFields` 会静默失效。

同时 `ModalForm` / `DrawerForm` 的示例与文档仍在教 `ElFormItem` + `ElInput`，与 `ProFormFields/index.md` 里「把字段组件放进它们的默认插槽即可」的说法自相矛盾，新用户照文档写出来的表单拿不到字段组件的只读、枚举、宽度等能力。

## What Changes

- 新增 `ProForm`：`ElForm` 的薄封装，绑定 `model` / `rules`，统一 `labelWidth`，并把 `readonly` 向下传递给所有字段组件。字段组件不再需要手写 `ElForm` 包裹。
- 新增 `ProFormList`：数组字段容器，负责行渲染、增删、复制、移动与空态，行内字段用**相对名**书写。
- 新增 `ProFormDependency`：按 `names` 订阅表单 `model` 的字段子集，通过作用域插槽把值交给模板，值变化才重渲染。
- 字段组件支持**路径前缀**：在 `ProFormList` 行内时，`name` 自动拼上 `['<listName>', '<index>']`，`ElFormItem.prop` 同步使用数组形式，保证根表单的校验与重置按行唯一。
- 字段组件按「字段显式值 > 列表级 > 表单级」继承 `readonly` / `disabled`。
- `ModalForm` / `DrawerForm` 内部改用 `ProForm` 承载字段，新增 `readonly` 与 `labelWidth` 两个 props；示例与文档改用字段组件，并在 `ModalForm` 示例中演示「弹窗内编辑明细行」。
- 文档页拆分：`ProForm`、`ProFormList`、`ProFormDependency` 各自独立成页，`ProFormFields` 只讲字段组件。

不改变既有字段组件的对外行为：`name` 仍是 `string | string[]`，不在 `ProFormList` 内时路径解析结果与现在完全一致。

## Capabilities

### New Capabilities

无。三个新组件都属于既有的表单字段能力边界，不新开能力。

### Modified Capabilities

- `pro-form-fields`: 新增「表单容器」「字段联动」「数组字段」三组需求；「通过 name 读写表单模型」补充路径前缀语义；「文档与发布」补充三个独立文档页与容器示例的字段组件用法。

## Impact

**Affected specs**

- `openspec/specs/pro-form-fields/spec.md`（delta 见 `specs/pro-form-fields/spec.md`）

**Affected code**

- `packages/element-pro/src/ProForm/`：新增（`index.vue`、`index.ts`、`types.ts`、`index.md`、`demo/`）
- `packages/element-pro/src/ProFormList/`：新增（`index.vue`、`index.ts`、`types.ts`、`index.md`、`components/ProFormListItem.vue`、`styles/index.scss`、`demo/`）
- `packages/element-pro/src/ProFormDependency/`：新增（`index.vue`、`index.ts`、`types.ts`、`index.md`、`demo/`）
- `packages/element-pro/src/shared/form/`：新增 `path.ts`（`toPath` / `joinPath`）、`context.ts`（路径前缀与表单级只读的 provide/inject）
- `packages/element-pro/src/ProFormFields/components/ProFormField.vue`：`name` 解析改为「前缀 + 自身路径」，`value` / `update` / `initialValue` / `:prop` 四处同步；只读按三级继承
- `packages/element-pro/src/ProFormFields/types.ts`、`utils.ts`、`index.ts`、`index.md`、`demo/`：移除已迁走的容器类型与章节，示例改用 `ProForm`
- `packages/element-pro/src/ModalForm/index.vue`、`DrawerForm/index.vue`、`shared/overlayForm/types.ts`：内部改用 `ProForm`，新增 `readonly` / `labelWidth`
- `packages/element-pro/src/index.ts`：导出与 `withInstall` 注册
- `.changeset/pro-form-fields-dependency-list.md`：`@wapri/element-pro` minor

**Dependencies**：不新增。行 id 用 `@wapri/gutils` 已导出的 `uuid`，深拷贝用同包的 `cloneDeep`。
