---
title: 模糊
group:
  title: 内置插件
  order: 11
---

# 模糊 `blur`

整画面高斯模糊，菜单里一行开关、一行模糊半径。适合做「付费内容未解锁」「不适内容打底」这类整屏处理。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `enabled` | 初始是否启用 | `boolean` | `false` |
| `radius` | 初始模糊半径（px） | `number` | `6` |
| `min` / `max` / `step` | 半径滑杆的区间与步长 | `number` | `0` / `30` / `1` |

## 用法

```ts
plugins: ['blur']
```

```ts
pluginEntry('blur', (config) => ({ ...config, enabled: true, radius: 12 }))
```

## 注意

- 半径按输出画布像素计算，全屏后视觉模糊程度不变。
- 与「背景模糊」的区别：这里连前景一起糊，背景模糊只糊四周。
