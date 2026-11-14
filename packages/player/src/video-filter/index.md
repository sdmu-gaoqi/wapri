---
title: 视频滤镜
group:
  title: 内置插件
  order: 9
---

# 视频滤镜 `videoFilter`

九个预设滤镜：原图、黑白、复古、鲜艳、暖色、冷色、褪色、胶片、反色，最后一个滑杆控制强度。预设写成 `video.style.filter`，与「画面调节」的亮度 / 对比度 / 饱和度叠加生效，互不覆盖。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `preset` | 初始预设 | `VideoFilterPreset` | `'none'` |
| `intensity` | 初始强度，0–1 | `number` | `1` |
| `presets` | 菜单里可选的预设 | `VideoFilterPreset[]` | 全部九个 |
| `min` / `max` / `step` | 强度滑杆的区间与步长 | `number` | `0` / `1` / `0.05` |

## 用法

```ts
plugins: ['videoFilter']
```

```ts
// 只要黑白与胶片，默认用胶片
pluginEntry('videoFilter', (config) => ({
  ...config,
  presets: ['none', 'mono', 'film'],
  preset: 'film',
}))
```

## 注意

- 预设与强度都退化为空时（选「原图」或强度 0），不会往 `filter` 里留片段。
- 截图插件会把这层滤镜一起画进截图。
