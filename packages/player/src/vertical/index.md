---
title: 横屏转竖屏
group:
  title: 内置插件
  order: 15
---

# 横屏转竖屏 `vertical`

把横屏素材放进竖屏容器（默认 9:16），三种适配方式：裁切铺满、完整显示、旋转 90°。打开时容器比例切到竖屏，关闭后还原开启前的比例。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `enabled` | 初始是否启用 | `boolean` | `false` |
| `mode` | 适配方式：`crop` / `contain` / `rotate` | `VerticalMode` | `'crop'` |
| `ratio` | 目标容器比例 | `AspectRatioValue` | `'9:16'` |

## 用法

```ts
plugins: ['vertical']
```

```ts
// 打开就是竖屏 + 旋转 90°
pluginEntry('vertical', (config) => ({ ...config, enabled: true, mode: 'rotate' }))
```

## 注意

- `rotate` 会把画面顺时针转 90°，适合手机竖拍但被存成横屏的素材。
- 与「画面比例」插件都会改容器比例，同时启用时后操作的生效。
- 组件高度固定（传了 `height`）时，竖屏比例只改变内部的画面适配，不会撑高容器。
