# Design

## Context

动机见 `proposal.md` - Why。这里只记录影响实现方式的现状与约束。

**字段组件当前是「绝对路径」模型。** `ProFormField.vue` 用 `useFormItem()` 取 `form.model`，再用 `get(model, props.name)` / `set(model, props.name, v)` 读写，`:prop="name"` 直接交给 `ElFormItem`。四处引用 `props.name`：`value` computed、`update()`、`onMounted` 的 `initialValue` 写入、模板里的 `:prop`。

**`ElForm` 的校验注册表按 `propString` 索引。** 已核对 `element-plus@2.14.4` 的 `form.vue_vue_type_script_setup_true_lang.mjs`：`addField` 把 `field.propString` 写进 `initialValues: Map`，`resetFields` 按 `propString` 回填；`propString` 是 `prop` 数组 `join('.')`。`form-item` 内部 `watch(propString)` 会在路径变化时 `removeField` + `addField` 重注册。

**`ElFormItem` 注入的是最近一层 form context。** `useFormItem()` 就是 `inject(formContextKey)`，没有跨层查找。所以「每行套一个嵌套 `ElForm`」会让行内 `prop` 变成相对路径，与根表单的 `initialValues` 键冲突。

**`get` / `set` 来自 `@wapri/gutils`（lodash-es）。** 两者都接受 `string | string[]` 路径，数组形式天然支持下标，不需要自己拼点分字符串。

**`uuid` 与 `cloneDeep` 已在依赖里。** `@wapri/gutils` 同时导出 `uuid`（re-export 自 `@wapri/gbase`）与 `cloneDeep`，`element-pro` 已依赖它；`@wapri/gbase` 不是 `element-pro` 的直接依赖，不能直接 import。

## Goals / Non-Goals

**Goals:**

- 提供 `ProForm` 容器，字段组件不再需要手写 `ElForm` 包裹。
- 行内字段用相对名书写，路径前缀由容器注入，业务不手拼下标。
- 前缀同时作用于值读写与 `ElFormItem.prop`，保证根表单的校验、`resetFields`、`clearValidate` 按行唯一。
- `ProFormDependency` 只订阅声明的字段，未声明字段变化不触发重渲染。
- 既有字段组件在非列表场景下行为零变化。

**Non-Goals:**

- 不实现 `ProFormFieldSet`、`ProFormCaptcha`、`request` 远程选项。
- 不实现拖拽排序；移动只提供上移/下移。
- 不实现虚拟滚动；行数由业务控制。
- 不改 `ProTableSearchForm.vue` 去消费字段组件（它没有 `model` / `prop`，属独立变更）。
- 不提供 `useProFormValues` composable（组件形态已覆盖，后续可加且不破坏）。

## Decisions

### 0. `ProForm` 是薄封装，只做三件事

`ProForm` 只负责：绑定 `model` / `rules`、统一 `labelWidth` 等表单属性、把 `readonly` 通过 provide 向下传递。不引入新的值管理机制，字段组件仍然直接读写 `ElForm.model`。

**为什么不做成「配置驱动」的表单（传 `fields` 数组自动渲染）：** 那会锁死模板能力（自定义插槽、`v-if`、`ElRow` 嵌套都要另开 API），而现有字段组件已经是声明式写法，容器只需要解决「谁来绑 model」和「只读怎么传下去」。

**为什么 `readonly` 走 provide 而不是逐个字段传：** 详情页展示整表只读是高频场景，逐字段传是重复劳动。字段显式传值时优先，继承只作兜底，与 `ProFormList` 的列表级只读共用同一套 `ProFormPathContext` 语义。

**为什么 `ModalForm` / `DrawerForm` 内部也换成 `ProForm`：** 它们本来就是 `ElForm + model + submitter`，换成 `ProForm` 后自动获得 `readonly` 通道，且三处表单容器行为一致，不会出现「弹窗里只读不生效」。

### 1. 路径前缀走 provide/inject，不套嵌套 `ElForm`

```text
ProFormList name="users"
  |
  +-- provide(ProFormPathKey, { prefix: ['users', 0], readonly, disabled })
  |     |
  |     +-- ProFormText name="profile.nickname"
  |           resolvedName = [...prefix, ...toPath('profile.nickname')]
  |                        = ['users', 0, 'profile', 'nickname']
  |           ElFormItem :prop="resolvedName"   <- 数组形式
  |           get/set(model, resolvedName)
  |
  +-- 行下标变化 -> prefix 变化 -> prop 变化 -> el-plus watch(propString) 自动重注册
```

**为什么不用嵌套 `ElForm`：** `ElFormItem` 注入最近一层 form context，行内 `prop` 会退化成相对路径 `name`，三行的 `propString` 全是 `'name'`，根表单的 `initialValues` 互相覆盖，`formRef.validate()` 也看不到行内字段。

**为什么不让业务写全路径：** 不改内核、零风险，但每加一个字段都要手拼 `users.${index}.`，漏一个就静默写错行——这正是要消灭的 bug 来源。

**为什么用数组路径而不是点分字符串：** `ElFormItem.prop` 支持 `string[]`，`get`/`set` 也支持；数组形式避免字段名里含 `.` 时的歧义，且 `propString` 由 el-plus 自己 `join('.')`，与既有行为一致。

**代价：** `ProFormField` 增加一次 `inject`，四处 `props.name` 换成 `resolvedName`。它是内部内核、不对外导出，改动不外溢。

### 2. `ProFormList` 自带 `ElFormItem`，承担数组级规则

列表根节点渲染 `ElFormItem :prop="name" :rules="rules"`，行内容放在其默认插槽。

**为什么：** 白拿数组级校验（`{ type: 'array', min: 1 }`）、必填星号，且 `resetFields()` 会把整个数组恢复成挂载时的值——弹窗编辑场景正需要这个。行内 `ElFormItem` 成为嵌套项，el-plus 的 `isNested` 分支在无 label 时不加缩进，视觉无副作用。

**替代方案（已否决）：** 不渲染 `ElFormItem`，数组级校验让业务写隐藏字段——多一个必须解释的坑，收益只是结构干净。

### 3. 行 id 与数组分离维护，不用 index 做 `:key`

`ProFormList` 内部维护 `rowIds: string[]`，与数组等长，`uuid()` 生成。

**为什么：** 用 index 做 `:key` 时删除中间行会让 Vue 复用实例，`prefix` 变了但输入框内部状态（光标、IME、下拉展开态）会串到别的行。

**同步策略：** `watch` 数组长度，长了补 id、短了截断；业务整体替换 `model.users = [...]` 时按新长度重建。id 只用于 `:key`，不写进 `model`，避免污染提交数据。

### 4. `initialValue` 按行深拷贝，复制行也深拷贝

新增行时 `cloneDeep(initialValue)`，复制行时 `cloneDeep(row)`。

**为什么：** 静态对象会被所有行共享引用，改一行全行变。`cloneDeep` 已在 `@wapri/gutils` 导出，无新依赖。

### 5. `ProFormDependency` 用 `names`，不用 `name`

`ProFormDependencyProps.names: string[]`，每个元素是一个点分路径。

**为什么：** 字段组件的 `name` 语义是「一个路径」（`string | string[]` 数组表示路径分段）。若 `ProFormDependency` 也用 `name: string[]` 表示「多个路径」，同一个 prop 名两种含义，是后续维护的定时炸弹。牺牲一点与 pro-components 的命名一致性，换掉这个歧义。

**实现形态：** 组件 + 作用域插槽，内部 `computed` 出 `Record<string, unknown>`，`watch` 深度比较后只在值变化时更新。插槽参数键名用 `names` 里的原始字符串（含点分形式），与业务书写一致。

**为什么不用 composable：** 这套库使用者以模板为主，`v-if` 直接写在插槽里比抽子组件顺手；且与 pro-components 的 API 心智一致。composable 可作为后续附加导出，不破坏现有形态。

### 6. 只读与禁用沿路径上下文继承

`ProFormPathContext` 同时携带 `readonly` / `disabled`；`ProForm` 另用 `proFormReadonlyKey` 提供表单级只读。字段按「字段显式值 > 列表级 > 表单级」继承。

**为什么：** 列表整体只读、整表只读都是常见需求（详情页展示明细），逐个字段传 `readonly` 是重复劳动。显式传值优先，继承只做兜底。

### 7. 目录与文档页：三个容器各自独立成页

`ProForm`、`ProFormList`、`ProFormDependency` 各占一个目录，各自有 `index.md` 与 `demo/`；`ProFormFields` 只讲字段组件。

**为什么：** 三个容器各有独立的 props / events / ref 面，塞进 `ProFormFields` 一页会让页面变成大杂烩，且 `ProForm` 是容器而非字段，语义上不属于「表单项」。dumi 的 `atomDirs` 按目录建页，一个目录一个页面即可，无需改配置。

**共享代码放哪：** 路径解析（`toPath` / `joinPath`）与 provide/inject 上下文放 `src/shared/form/`，三个容器与字段组件都从那里 import，避免容器之间互相依赖。

## Risks / Trade-offs

**[删除行后 `initialValues` 残留旧值]** → `ElForm.removeField` 会把被删行的初值塞回 `initialValues`；同下标再新增时 `addField` 会捡到这批旧值。缓解：删行后主动 `clearValidate`，文档写明「重置回挂载时的值」而非「重置为空」。

**[业务整体替换数组时 id 与数据不同步]** → `watch` 长度变化重建 id；长度不变但内容整体替换时，行实例复用、值由 `model` 驱动，不会串值，仅丢失行内未提交的临时 UI 状态（如展开的下拉），可接受。

**[`ProFormDependency` 深度 watch 大对象有开销]** → 只 watch `names` 声明的字段，且用浅比较 + `Object.is` 逐键比对；业务若把整个大数组塞进依赖，开销由业务自己承担，文档提示。

**[前缀注入对既有字段组件是侵入式改动]** → 四处 `props.name` 改 `resolvedName`，无前缀时 `resolvedName` 与 `props.name` 等价（`toPath` 对 `string` 与 `string[]` 都返回数组，`get`/`set` 对数组与点分字符串等价）。实施后跑 `pnpm build` 与既有三个 demo 人工验证。

**[`ProFormList` 行内 `ElFormItem` 嵌套可能影响 label 宽度]** → el-plus 的 `isNested` 分支在无 label 时不加 `contentStyle` 缩进；行内字段默认不传 `label` 时无影响，传了则按嵌套项渲染，符合预期。

**[`ModalForm` / `DrawerForm` 换成 `ProForm` 后 `formProps.labelWidth` 与新增 `labelWidth` prop 可能冲突]** → `ProForm` 内部按 `{ ...formProps, labelWidth: props.labelWidth }` 合并，显式 `labelWidth` 优先；`labelWidth` 未传时 `ProForm` 的默认值 `120px` 会覆盖 `formProps.labelWidth`，因此两个容器把 `labelWidth` 默认值设为 `undefined`，未传时保持 `ElForm` 自身默认。

## Migration Plan

纯新增，无迁移。既有字段组件在非列表场景下路径解析结果不变，`ProTable` 的公开 API 不变。`ModalForm` / `DrawerForm` 新增两个可选 props，不传时行为与之前一致。

回滚：删除 `ProForm/`、`ProFormList/`、`ProFormDependency/`、`shared/form/`，还原 `ProFormField.vue` 的四处 `props.name`，把 `ModalForm` / `DrawerForm` 的 `ProForm` 换回 `ElForm`，移除 `src/index.ts` 的注册项、changeset 与文档新增页。
