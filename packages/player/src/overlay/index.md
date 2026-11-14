---
title: 视频叠加
group:
  title: 内置插件
  order: 18
---

# 视频叠加 `overlay`

在画面上叠一层素材：图片（角标、水印）或视频（贴片、动效）。可以拖拽位置，菜单里有透明度、大小与「重置位置」。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `src` | 素材地址，留空时打开开关只给提示 | `string` | `''` |
| `type` | 素材类型：`image` / `video` | `OverlayType` | `'image'` |
| `x` / `y` | 中心点位置，容器百分比 0–100 | `number` | `68` / `68` |
| `width` | 宽度占容器的百分比 | `number` | `24` |
| `opacity` | 不透明度 0–1 | `number` | `1` |
| `draggable` | 是否允许拖拽 | `boolean` | `true` |
| `loop` | 视频素材是否静音循环 | `boolean` | `true` |

## 用法

```ts
pluginEntry('overlay', (config) => ({
  ...config,
  src: 'https://example.com/badge.png',
  width: 32,
  x: 76,
  y: 78,
}))
```

## 注意

- 叠加层是 DOM 节点，会随播放器一起缩放；位置按容器百分比保存，全屏后相对位置不变。
- 视频素材强制静音播放，避免和主视频的声音叠在一起。
- 拖拽时只在本层拦截指针事件，不会挡住控制条的点击。
