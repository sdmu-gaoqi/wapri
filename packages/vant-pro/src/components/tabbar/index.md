---
title: WaTabbar 底部菜单
group:
  title: 导航
  order: 3
---

# WaTabbar 底部菜单

`van-tabbar` 的一层薄封装：菜单项用数组声明，图标支持常态与选中态两套，`route` 固定关闭，跳转交给父组件。

<code src="./demo/basic.vue" iframe="640" title="基础用法：双态图标、角标与红点"></code>

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `string` | 必填 | 当前 `key` |
| `items` | `TabbarItem[]` | 必填 | `{ key, title, icon?, activeIcon?, badge?, dot? }` |
| `fixed` | `boolean` | `true` | 透传 `van-tabbar` |
| `safeAreaInsetBottom` | `boolean` | `true` | 透传 |
| `placeholder` | `boolean` | `false` | 透传 |
| `border` | `boolean` | `true` | 透传 |
| `activeColor` | `string` | — | 选中色 |
| `inactiveColor` | `string` | — | 未选中色 |
| `zIndex` | `number \| string` | — | 层级 |

## Emits

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `(key: string)` | 切换后抛新 key |
| `change` | `(item: TabbarItem)` | 切换后抛完整项 |

## Slots

- `#icon="{ item, active }"`：覆盖图标渲染。默认用 `van-icon`，`active && item.activeIcon` 时优先用 `activeIcon`。
