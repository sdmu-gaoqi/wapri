---
title: AB 循环
group:
  title: 内置插件
  order: 6
---

# AB 循环 `abLoop`

右侧菜单里提供「设置 A 点」「设置 B 点」「清除 A-B」三项，菜单项右侧实时显示已设置的区间（只设了一个点时另一半显示 `--:--`）。两个点都设好后，播放到 B 点自动跳回 A 点。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `offset` | 回跳时相对 B 点的提前量（秒），避免停在最后一帧 | `number` | `0` |

## 用法

```ts
plugins: [pluginEntry('abLoop', (config) => ({ ...config, offset: 0.2 }))]
```
