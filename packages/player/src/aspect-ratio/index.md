---
title: 画面比例
group:
  title: 内置插件
  order: 2
---

# 画面比例 `aspectRatio`

在右侧菜单里列出可选比例，选中后写入 `player.aspectRatio`。`default` 表示跟随视频原始比例。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `ratios` | 可选比例列表，按 `宽:高` 写 | `AspectRatioValue[]` | `['default', '16:9', '4:3', '21:9']` |
| `defaultRatio` | 初始比例 | `AspectRatioValue` | `'default'` |

## 用法

```ts
plugins: [pluginEntry('aspectRatio', (config) => ({ ...config, ratios: ['default', '16:9', '1:1'] }))]
```
