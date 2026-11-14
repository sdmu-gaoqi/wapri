---
title: 播放速度
group:
  title: 内置插件
  order: 1
---

# 播放速度 `playbackRate`

在右侧菜单里列出可选语速，选中后写入 `player.playbackRate`，菜单项右侧显示当前语速。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `rates` | 可选语速列表 | `number[]` | `[0.5, 0.75, 1, 1.25, 1.5, 2]` |
| `defaultRate` | 初始语速，与默认值不同时才会写进实例 | `number` | `1` |

## 用法

```ts
plugins: [
  'playbackRate',
  pluginEntry('playbackRate', (config) => ({ ...config, rates: [1, 1.5, 2] })),
]
```
