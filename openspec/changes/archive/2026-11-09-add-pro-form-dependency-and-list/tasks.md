# Tasks

## 1. 共享路径与上下文

- [x] 1.1 新增 `shared/form/path.ts`，导出 `ProFormFieldName`、`ProFormPath`、`toPath`、`joinPath`；验证：`toPath('a.b')` 返回 `['a','b']`、`toPath(['a','b'])` 原样返回、`joinPath(['users','0'], 'a.b')` 返回 `['users','0','a','b']`
- [x] 1.2 新增 `shared/form/context.ts`，导出 `proFormPathKey`、`proFormReadonlyKey`、`useProFormPath`、`useProFormReadonly`、`provideProFormPath`；验证：`pnpm lint` 通过且无 `any`

## 2. ProForm 容器

- [x] 2.1 新增 `ProForm/index.vue`：绑定 `model` / `rules`，合并 `labelWidth` 等表单属性，provide 表单级只读；验证：`<ProForm :model="model">` 内字段可读写 `model`
- [x] 2.2 暴露 `ProFormAction`（`validate` / `validateField` / `resetFields` / `clearValidate` / `scrollToField` / `formRef`）；验证：`ref<ProFormAction>()` 可调用 `validate()` 并 reject 字段错误
- [x] 2.3 新增 `ProForm/types.ts`、`index.ts`、`index.md`、`demo/basic.vue`、`demo/readonly.vue`；验证：`pnpm dev` 下 `/element-pros/pro-form` 两个示例可交互

## 3. 字段组件接入前缀与只读继承

- [x] 3.1 `ProFormField.vue` 用 `useProFormPath()` 计算 `resolvedName`，替换 `value` / `update()` / `onMounted` / `:prop` 四处 `props.name`；验证：既有 `ProFormFields/demo` 三个示例行为不变
- [x] 3.2 `ProFormField.vue` 按「字段显式值 > 列表级 > 表单级」继承 `readonly` / `disabled`；验证：`ProForm` 设 `readonly` 后字段渲染为文本
- [x] 3.3 验证嵌套路径与数组路径等价：`name="profile.nickname"` 与 `:name="['profile','nickname']"` 写入同一位置

## 4. ProFormList

- [x] 4.1 新增 `ProFormList/index.vue`：渲染 `ElFormItem :prop="name" :rules="rules"`，行内容走默认插槽并由 `ProFormListItem` 提供路径上下文；验证：数组级 `rules` 为空数组时 `formRef.validate()` 失败
- [x] 4.2 实现行 id 数组与长度同步（`uuid()`、`watch` 长度补/截）；验证：删除中间行后剩余行值跟随行移动、输入框状态不串行
- [x] 4.3 实现新增 / 删除 / 复制 / 上移 / 下移，新增与复制均 `cloneDeep`；验证：复制行后改一行不影响另一行
- [x] 4.4 实现空态与 `emptyText`（默认文案、传 `false` 不展示）、`max` / `min` 行数限制；验证：空数组时展示默认文案，达到上限后新增按钮禁用
- [x] 4.5 实现 `readonly` / `disabled` 下隐藏增删改操作并向下传递；验证：`readonly` 时无操作按钮、行内字段为文本
- [x] 4.6 新增 `ProFormList/types.ts`、`index.ts`、`styles/index.scss`、`index.md`、`demo/basic.vue`、`demo/validate.vue`、`demo/readonly.vue`；验证：`/element-pros/pro-form-list` 三个示例可交互

## 5. ProFormDependency

- [x] 5.1 新增 `ProFormDependency/index.vue`：按 `names` 计算值集合，作用域插槽传出；验证：`names=['type']` 时插槽参数含 `type`
- [x] 5.2 支持点分路径与列表内前缀；验证：`ProFormList` 行内使用时读到当前行的值
- [x] 5.3 新增 `ProFormDependency/types.ts`、`index.ts`、`index.md`、`demo/basic.vue`、`demo/in-list.vue`；验证：`/element-pros/pro-form-dependency` 两个示例可交互

## 6. 容器与导出

- [x] 6.1 `ModalForm` / `DrawerForm` 内部改用 `ProForm`，新增 `readonly` 与 `labelWidth` props；验证：弹窗内 `readonly` 生效
- [x] 6.2 `src/index.ts` 增加三个容器的具名导出与 `components[]` 注册项；验证：`import { ProForm, ProFormList, ProFormDependency } from '@wapri/element-pro'` 可用
- [x] 6.3 `ProFormFields` 移除已迁走的容器类型与章节，示例改用 `ProForm`；验证：`/element-pros/pro-form-fields` 三个示例仍可交互

## 7. 文档与发布

- [x] 7.1 `ModalForm/index.md`、`DrawerForm/index.md` 正文改为「内部使用 `ProForm` 承载字段」，Props 表补 `readonly` / `labelWidth`；验证：文档描述与示例一致
- [x] 7.2 新增 `.changeset/pro-form-fields-dependency-list.md`，`@wapri/element-pro` minor；验证：`pnpm ver` 可识别该 changeset
- [x] 7.3 同步 `AGENTS.md` 与 `openspec/project.md` 的表单约定；验证：两处描述与实现一致

## 8. 集成验证

- [x] 8.1 运行 `pnpm lint` 与 `npx oxfmt --check`（仅改动文件），全部通过
- [x] 8.2 运行 `pnpm --filter @wapri/element-pro build`，确认 `dist/index.d.ts` 含三个新组件与新类型
- [x] 8.3 运行 `pnpm doc`，确认文档站构建成功且四个页面无报错

## Workflow follow-up

- 实施与校验通过后执行 `npx -y @fission-ai/openspec@latest archive add-pro-form-dependency-and-list`。
- 归档后确认 `openspec/specs/pro-form-fields/spec.md` 已合并本次 delta。
