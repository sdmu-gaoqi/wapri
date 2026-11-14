---
title: 画面翻转
group:
  title: 内置插件
  order: 3
---

# 画面翻转 `flip`

在右侧菜单里切换正常 / 水平 / 垂直，选中后写入 `player.flip`，由 artplayer 的 `data-flip` 与 CSS 完成翻转。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `modes` | 可选方向列表 | `FlipMode[]` | `['normal', 'horizontal', 'vertical']` |
| `defaultMode` | 初始方向 | `FlipMode` | `'normal'` |

## 用法

```ts
plugins: [
  'flip',
  pluginEntry('flip', (config) => ({ ...config, modes: ['normal', 'horizontal'] })),
]
```
