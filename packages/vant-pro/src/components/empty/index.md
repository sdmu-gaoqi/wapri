---
title: WaEmpty 空状态
group:
  title: 基础
  order: 4
---

# WaEmpty 空状态

`van-empty` 的一层业务预设：`module` 决定默认图与文案，显式传 `image` / `description` 时以 props 为准，按钮与页脚按需打开。

<code src="./demo/basic.vue" iframe="520" title="基础用法：切换预设与刷新按钮"></code>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `image` | `string` | `'default'` | `van-empty` 内置名（`default` / `search` / `network` / `error`）或图片地址 |
| `description` | `string` | `''` | 为空时回落到 `module` 预设，再回落到「暂无数据」 |
| `module` | `EmptyModule` | — | 预设：`list` / `table` / `search` / `network` / `notice` / `error` |
| `size` | `number \| string` | — | 透传 `van-empty` 的 `image-size` |
| `showAction` | `boolean` | `false` | 是否显示按钮 |
| `actionText` | `string` | `'刷新'` | 按钮文案 |
| `loading` | `boolean` | `false` | 按钮 loading，期间不 emit |

## Emits

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `action` | `()` | 点按钮；`loading` 为 `true` 时不触发 |

## Slots

- 默认插槽：追加在描述下方的自定义内容（透传给 `van-empty`）。
- `#footer`：按钮下方的页脚区域。

## 预设对照

| `module` | 图 | 文案 |
| --- | --- | --- |
| `list` / `table` | `default` | 暂无数据 |
| `search` | `search` | 没有找到相关内容 |
| `network` | `network` | 网络异常，请稍后重试 |
| `notice` | `default` | 暂无通知 |
| `error` | `error` | 加载失败，请稍后重试 |
