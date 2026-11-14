---
title: 背景模糊
group:
  title: 内置插件
  order: 12
---

# 背景模糊 `backgroundBlur`

前景保持原比例居中显示，四周用同一帧放大、模糊后铺满，竖屏容器里放横屏素材时不再留黑边。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `enabled` | 初始是否启用 | `boolean` | `false` |
| `radius` | 背景模糊半径（px） | `number` | `16` |
| `min` / `max` / `step` | 半径滑杆的区间与步长 | `number` | `0` / `40` / `1` |

## 用法

```ts
plugins: ['backgroundBlur']
```

```ts
pluginEntry('backgroundBlur', (config) => ({ ...config, enabled: true, radius: 24 }))
```

## 注意

- 前景的显示方式由「横屏转竖屏」的适配方式决定，默认按比例完整显示。
- 背景会额外放大 1.15 倍，避免模糊后边缘透出黑边。
