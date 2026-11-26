---
title: WaFilterBar 筛选栏
group:
  title: 筛选
  order: 2
---

# WaFilterBar 筛选栏

筛选条上放「字段 ▾」触发器：点字段弹出窄下拉，点「筛选」展开全字段面板。状态全部交给内部 `van-form` 管，父组件只维护一份 `FilterBarModel`。

<code src="./demo/basic.vue" iframe="640" title="基础用法：字段下拉 + 筛选面板"></code>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `FilterBarModel` | `{}` | 已提交的筛选值 |
| `fields` | `FilterField[]` | 必填 | 字段定义 |
| `inlineKeys` | `string[]` | — | 兜底的触发器名单：命中的字段在筛选条上显示「值 ▾」，字段上的 `inline` 优先 |
| `expandText` | `string` | `'筛选'` | 触发按钮与面板标题 |
| `confirmText` | `string` | `'确定'` | 面板确认按钮 |
| `resetText` | `string` | `'重置'` | 面板重置按钮 |
| `showReset` | `boolean` | `true` | 是否显示重置 |
| `showSummary` | `boolean` | `false` | 是否在筛选条下方展示已选条件胶囊（手机上默认不展示） |
| `collapsible` | `boolean` | `true` | 摘要超过 1 条时可收起 |
| `autoConfirm` | `boolean` | `false` | 是否在每次改动后立即同步 `v-model`；字段下拉里的单选始终即时提交 |

## Emits

| 事件 | 参数 | 触发时机 |
| --- | --- | --- |
| `update:modelValue` | `(value: FilterBarModel)` | 提交后（确定 / 重置 / 删摘要 / `autoConfirm` 下的内联改动） |
| `change` | `(value: FilterBarModel, key?: string)` | **任何**控件改动，携带最新草稿与变更字段 |
| `confirm` | `(value: FilterBarModel)` | 点「确定」 |
| `reset` | `()` | 点「重置」 |

## 字段定义

公共字段：`key`、`label`、`inline?`（`true` 时在筛选条上显示「字段 ▾」触发器，点开改值；不传只在面板里出现）。

| `type` | 额外字段 | 值结构 |
| --- | --- | --- |
| `'tag'` | `multiple?`、`options`、`placeholder?` | `string \| string[]` |
| `'range'` | `min?`、`max?`、`unit?`、`precision?`、`placeholder?: [string, string]` | `WaNumberRange`：`{ min?; max? }` |
| `'date'` | `dateType?: 'date' \| 'datetime' \| 'month'`、`shortcuts?`、`placeholder?` | `WaDateRange`：`{ start; end; shortcut? }` |
| `'select'` | `options`、`multiple?`、`placeholder?` | `string \| string[]` |

```ts
interface FilterOption {
  label: string
  value: string
  disabled?: boolean
}

/** 点击时求值：跨天不刷新页面也能拿到相对当前时间的区间 */
interface DateShortcut {
  name: string
  range: () => [string, string]
}
```

`FilterBarModel = Record<string, FilterValue | undefined>`，空值（空串、空数组、只有一端的区间）不会进 `v-model`。

## 行为约定

- 每个字段是一个 `WaFilter*` 控件，统一挂在 `WaFilterBar` 的 `van-form` 上；选项、价格、日期与下拉共用一套字段样式。
- 点字段触发器弹出**窄下拉**（选项列表 400rpx，价格 / 日期 640rpx），贴着触发器对齐；单选点完立即提交并收起，多选 / 价格 / 日期带确认按钮。点「筛选」才展开全字段面板，按钮不展示已选数量。
- 字段触发器与「筛选」展开时，文字和图标统一使用主色高亮。
- 全字段面板贴在筛选条下方，标题与底部按钮固定、只有字段区滚动；不铺遮罩，只在面板底部留一层渐隐投影。日期 / 下拉弹层点击自身遮罩时，整个筛选面板一并收起，未确认修改丢弃。
- 日期快捷项内置「今日 / 昨日 / 近 7 天 / 近 30 天」（四个等宽按钮），结果是 `YYYY-MM-DD`；传 `shortcuts: []` 表示不要快捷项。
- 日期控件点开是 `van-date-picker` 年月日滚轮（`month` 类型只选年月），`datetime` 字段的结束值统一补到 `23:59:59`，避免漏掉当天。
- 摘要默认关闭；开启后只统计已提交条件，多选显示为「首个标签 +N」，日期优先显示快捷项名。
- 视觉约定：字段标题在上、控件占满整行（不做 label 左右分栏）；选项 3 列等宽，价格、日期、下拉统一 80rpx 高圆角格子。
- `autoConfirm: false`（默认）时全字段面板的改动只更新草稿并 emit `change`，`v-model` 在「确定 / 重置」时才同步；`autoConfirm: true` 时每次改动立即同步。**面板收起时未确认的修改一律丢弃。**

## 单独使用子控件

`WaFilterTag` / `WaFilterRange` / `WaFilterDate` / `WaFilterSelect` 也对外导出，可以放进自己的 `van-form`。每个控件都是 `field` + `modelValue` + `inline?` 三个 props，只 emit `update:modelValue`：

```vue | pure
<van-form>
  <WaFilterTag
    :field="tagField"
    :model-value="form.status"
    @update:model-value="(value) => (form.status = value)"
  />
</van-form>
```
