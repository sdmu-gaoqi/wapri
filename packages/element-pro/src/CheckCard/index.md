---
title: CheckCard 多选卡片
group:
  title: 表单
  order: 3
---

# CheckCard 多选卡片

选中态采用右上角三角角标、主题色边框与浅色背景，卡片圆角为 8px。角标内缩 2px，沿用 ProComponents 的 0.3s 透明度及边框过渡；取消选择也有过渡，颜色跟随 Element Plus 主题。

参考 [ProComponents CheckCard](https://next-procomponents.ant.design/components/check-card/) 的选项卡交互，用于展示标题、描述、头像等信息并进行选择。使用 Vue 的 v-model 绑定状态。

<code src="./demo/basic.vue"></code>

## 尺寸

切换 size 会同时更新宽度、最小高度、内边距、标题/描述字号与头像尺寸。高度随内容自然增长，长文字不裁切；组内不同尺寸的卡片顶部对齐，子项 size 优先于组配置。

<code src="./demo/size.vue"></code>

| size | 宽度 | 最小高度 | 内边距 | 标题字号 | 描述字号 | 头像尺寸 |
| --- | --- | --- | --- | --- | --- | --- |
| small | 240px | 80px | 16px | 14px | 12px | 32px |
| default | 320px | 96px | 20px | 16px | 14px | 40px |
| large | 400px | 112px | 24px | 18px | 16px | 48px |

## 使用

从 `@wapri/element-pro` 导入 `CheckCard`、`CheckCardGroup`。卡片组也可以使用 `CheckCard.Group`。支持单独 `app.use(CheckCard)` 注册卡片和卡片组。样式使用组件库的 `@wapri/element-pro/dist/style.css`。

独立卡片使用 `v-model:checked`；组使用 `v-model`，默认单选，设置 `multiple` 启用多选。再次点击已选项会取消：单选清空为 `null`，多选清空为 `[]`。组内卡片必须提供唯一的 `value`，支持字符串和数字（`0` 与空字符串均有效）。组的选择状态优先于子卡片的 checked/defaultChecked。

## CheckCard Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| checked | boolean | — | 受控状态，支持 v-model:checked |
| defaultChecked | boolean | false | 非受控初始状态，仅初始化时读取 |
| value | string / number | — | 组内选项的唯一值，组内缺少 value 时不可选 |
| title / description | string | — | 标题与描述 |
| avatar / cover | string | — | 图片 URL；cover 模式替代标题、描述、头像 |
| disabled / loading | boolean | false | 禁用或加载状态，均不可切换 |
| bordered | boolean | true | 是否显示默认边框，选中时仍有高亮边框 |
| size | small / default / large | 继承 ConfigProvider，未配置时为 default | 联动宽度、最小高度、内边距、字号及头像尺寸，详见尺寸表；可用 style 覆盖 |

组内 size、bordered 默认继承组配置；组禁用或加载时，子卡片不能解除该状态。支持 Element Plus Form 的整体 disabled 状态。

## CheckCardGroup Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | string / number / Array<string / number> / null | — | 受控选择值，支持 v-model；单选传标量或 null，多选传数组 |
| defaultValue | 同 modelValue | null | 非受控初始值，仅初始化时读取 |
| multiple | boolean | false | 多选模式 |
| options | Array<string / number / CheckCardOption> | — | 配置式生成卡片，默认插槽优先 |
| disabled / loading | boolean | false | 整组禁用或加载 |
| bordered | boolean | true | 默认边框 |
| size | small / default / large | 继承 ConfigProvider，未配置时为 default | 统一尺寸 |

`CheckCardOption` 支持 value（必填）、title、description、avatar、cover、disabled、loading、bordered、size。

## 事件与插槽

- CheckCard：`update:checked(checked)`、`change(checked)`，仅用户切换时触发。
- CheckCardGroup：`update:modelValue(value)`、`change(value)`，仅用户切换时触发。
- CheckCard 插槽：`title`、`description`、`avatar`、`cover`、`extra`；`default` 为描述区域，优先于 description。
- CheckCardGroup：`default` 自定义卡片布局，存在时忽略 options。
- extra 中的点击和键盘事件不会切换卡片；正文内的按钮、链接、输入框也不会触发选择。

卡片可通过 Tab 聚焦，Space / Enter 切换，有 checkbox 语义和焦点边框。组可通过 aria-label 命名。放入 ElFormItem 并绑定对应 model 字段后，选择会触发 change 校验；表单重置或外部修改绑定值会同步更新显示。使用纯图片模式时请提供 title 或 aria-label 作为可访问名称。

导出类型：`CheckCardProps`、`CheckCardGroupProps`、`CheckCardOption`、`CheckCardValue`、`CheckCardGroupValue`、`CheckCardSize`。
