 # Tasks

## 1. 字段级共享能力上移

- [x] 1.1 新建 `packages/element-pro/src/shared/field/types.ts`，迁入 `ValueType`、`ValueEnum`、`ValueEnumItem`、`Key`、`DataIndex`，验证 `pnpm --filter @wapri/element-pro build` 通过
- [x] 1.2 新建 `packages/element-pro/src/shared/field/utils.ts`，迁入 `getValueEnumOptions`、`toTreeOptions`、`findEnumPath`、`formatCellValue` 与 `TreeSelectOption`，验证 `pnpm lint` 无新增告警
- [x] 1.3 把 `ProTable/types.ts` 中的上述类型改为从 `../shared/field/types` re-export，验证 `ProTable/types.ts` 不再保留重复定义
- [x] 1.4 把 `ProTable/utils.ts` 中的上述函数改为从 `../shared/field/utils` re-export，保留 `getDataIndexValue`、`getDataIndexKey`、`getRecordKey` 原地不动，验证 `ProTable` 内既有 import 无需改动即可编译
- [x] 1.5 验证导出面零变化：`pnpm --filter @wapri/element-pro build` 后检查 `dist/index.d.ts` 仍包含 `ValueType`、`ValueEnum`、`ValueEnumItem`

## 2. 字段内核

- [x] 2.1 新建 `packages/element-pro/src/ProFormFields/types.ts`，定义 `ProFormFieldProps`、`ProFormFieldWidth`、`ProFormFieldValueEnum` 等公开类型，验证 `pnpm lint` 通过且无 `any`
- [x] 2.2 新建 `packages/element-pro/src/ProFormFields/utils.ts`，实现 `width` 枚举到像素的映射（`xs`/`sm`/`md`/`lg`/`xl` → `104`/`216`/`328`/`440`/`552`）与 `placeholder` 推导，验证映射表与 `design.md` Decisions 第 5 条一致
- [x] 2.3 新建 `packages/element-pro/src/ProFormFields/components/ProFormField.vue`，用 `useFormItem()` 取 `form.model` 与 `formItem.propString`，实现 `get`/`set` 路径读写并把 `ElForm.model` 收窄为 `Record<string, unknown>`，验证组件内不出现 `any`
- [x] 2.4 在 `ProFormField.vue` 内实现 `valueType` 到 14 个控件的分发，验证每个分支都能在 demo 中渲染出对应控件
- [x] 2.5 在 `ProFormField.vue` 内实现 `readonly` 分支，调用 `formatCellValue(value, emptyText, valueEnum)` 渲染 `<span>`，验证枚举、区间、空值三种情况展示与 `ProTable` 单元格一致
- [x] 2.6 在 `ProFormField.vue` 内实现 `options` 优先于 `valueEnum` 的选项解析，验证同时传入两者时下拉项来自 `options`
- [x] 2.7 验证缺上下文降级：在 `ElForm` 外渲染 `ProFormField` 不抛错且控件可见

## 3. 字段组件

- [x] 3.1 新建 `ProFormText.vue`，`ElFormItem` + `ProFormField` 薄壳，验证 `name`、`label`、`rules`、`placeholder` 生效
- [x] 3.2 新建 `ProFormTextArea.vue`，验证 `type="textarea"` 且 `autosize` 生效
- [x] 3.3 新建 `ProFormText.Password` 子组件并通过 `withInstall(ProFormText, { Password })` 挂载，验证 `ProFormText.Password` 可被 `app.use` 注册
- [x] 3.4 新建 `ProFormDigit.vue`，验证 `fieldProps.precision` 可覆盖且默认不设精度
- [x] 3.5 新建 `ProFormMoney.vue`，默认 `precision: 2`，验证可被 `fieldProps` 覆盖
- [x] 3.6 新建 `ProFormSelect.vue`，验证 `valueEnum` 生成下拉项、`options` 优先
- [x] 3.7 新建 `ProFormTag.vue`，复用既有 `TagSelector`，验证 `multiple`、`showAll`、`allText` 透传
- [x] 3.8 新建 `ProFormTreeSelect.vue`，验证 `valueEnum` 的 `children` 生成层级且 `disabled` 逐项生效
- [x] 3.9 新建 `ProFormCascader.vue`，验证层级选项与路径值读写
- [x] 3.10 新建 `ProFormDatePicker.vue`、`ProFormDateRangePicker.vue`、`ProFormDateTimePicker.vue`、`ProFormDateTimeRangePicker.vue`，验证 `type` 分别为 `date`、`daterange`、`datetime`、`datetimerange`
- [x] 3.11 新建 `ProFormSwitch.vue`，验证布尔值读写与 `readonly` 展示为 `是`/`否`
- [x] 3.12 验证 `colProps` 透传到外层 `ElCol`，未传时字段占满一行

## 4. 注册与样式

- [x] 4.1 新建 `ProFormFields/index.ts`，用 `withInstall` 导出 14 个组件与全部公开类型，验证 `import { ProFormText } from '../ProFormFields'` 可用
- [x] 4.2 新建 `ProFormFields/styles/index.scss`，class 前缀使用 `constant/index.ts` 的 `prefix`，验证 `pnpm lint` 与 `pnpm format:check` 通过
- [x] 4.3 修改 `packages/element-pro/src/index.ts`，加入 import、`export *`、具名导出与 `components` 注册数组，验证 `app.use(ElementPro)` 后 14 个组件均全局可用

## 5. 文档与示例

- [x] 5.1 新建 `ProFormFields/index.md`，frontmatter 为 `title: ProFormFields 表单项`、`group.title: 表单`、`order: 3`，正文说明 `ProFormFields` 是文档页名称而非组件名，验证 `pnpm dev` 后 `/element-pros/pro-form-fields` 可访问
- [x] 5.2 新建 `demo/basic.vue`，覆盖全部 14 个字段与 `rules` 校验，验证 `formRef.validate()` 能拦截空值
- [x] 5.3 新建 `demo/readonly.vue`，验证枚举、区间、空值三种只读展示
- [x] 5.4 新建 `demo/layout.vue`，验证 `width` 五档与 `colProps` 栅格
- [x] 5.5 在 `index.md` 补 Props 总表（`name`、`label`、`rules`、`required`、`readonly`、`disabled`、`placeholder`、`initialValue`、`valueEnum`、`options`、`width`、`colProps`、`tooltip`、`fieldProps`、`formItemProps`），验证表中每一项都能在 demo 中找到用法
- [x] 5.6 在 `index.md` 写明前置条件：字段组件必须在 `ElForm` 内且 `ElForm` 必须传 `model`，验证文档表述与 2.7 的实际行为一致

## 6. 集成验证

- [x] 6.1 在 `ModalForm` 内组合字段组件，验证校验失败时不触发 `finish`、校验通过时 `finish` 携带完整 `model`
- [x] 6.2 验证 `ElForm` 的 `:rules` 与字段自身 `rules` 合并校验生效
- [x] 6.3 运行 `pnpm lint`、`pnpm format:check`、`pnpm --filter @wapri/element-pro build`，全部通过
- [x] 6.4 运行 `pnpm doc`，确认文档站构建成功且新页面在产物中

## 7. 发布登记

- [x] 7.1 新增 `.changeset/pro-form-fields.md`，内容为 `"@wapri/element-pro": minor` 并说明新增表单字段组件集，验证 `pnpm changeset status` 能识别
- [x] 7.2 在根 `AGENTS.md` 的 Repository Map 与 `openspec/project.md` 的包表中补充 `ProFormFields` 说明，验证两处描述一致

## Workflow follow-up

- 实施完成后运行 `npx -y @fission-ai/openspec@latest validate add-pro-form-fields --strict`。
- 校验通过后运行 `npx -y @fission-ai/openspec@latest archive add-pro-form-fields` 归档。
- 提交、推送、开 PR 由人工执行。
