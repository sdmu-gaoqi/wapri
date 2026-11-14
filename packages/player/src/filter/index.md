---
title: 画面调节
group:
  title: 内置插件
  order: 7
---

# 画面调节 `filter`

在右侧菜单里提供亮度、对比度、饱和度三根滑杆，实时写入视频元素的 CSS `filter`，最后一行的「恢复默认」一键还原。拖动滑杆时副标题显示当前百分比。

截图插件会把这里的滤镜值一起画进截图。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `brightness` | 初始亮度，100 为原始值 | `number` | `100` |
| `contrast` | 初始对比度 | `number` | `100` |
| `saturate` | 初始饱和度 | `number` | `100` |
| `min` | 滑杆最小值 | `number` | `0` |
| `max` | 滑杆最大值 | `number` | `200` |
| `step` | 滑杆步长 | `number` | `1` |

## 用法

```ts
plugins: [pluginEntry('filter', (config) => ({ ...config, min: 50, max: 150 }))]
```
