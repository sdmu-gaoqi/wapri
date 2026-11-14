---
title: 绿幕
group:
  title: 内置插件
  order: 14
---

# 绿幕 `chromaKey`

按颜色抠像：把与目标色接近的像素变透明，相似度控制抠多干净，羽化控制边缘过渡。菜单里的「吸取背景色」会进入取色模式，点画面任意位置即可把该点设为抠像色。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `enabled` | 初始是否启用 | `boolean` | `false` |
| `color` | 初始抠像色，`#rrggbb` | `string` | `'#00ff00'` |
| `similarity` | 相似度 0–1，越大抠得越干净 | `number` | `0.35` |
| `smoothness` | 边缘羽化 0–1 | `number` | `0.12` |
| `similarityMin` / `similarityMax` | 相似度滑杆区间 | `number` | `0` / `1` |
| `smoothnessMin` / `smoothnessMax` | 羽化滑杆区间 | `number` | `0` / `0.6` |

## 用法

```ts
plugins: ['chromaKey']
```

```ts
pluginEntry('chromaKey', (config) => ({ ...config, enabled: true, color: '#1ad11a', similarity: 0.4 }))
```

## 注意

- 抠掉的区域是透明的，会露出播放器底色（黑色）；要换底色请在该区域上方再叠一层背景。
- 取色需要读像素，视频源必须允许跨域，否则会提示取色失败。
- 逐像素处理会把工作画布压到长边 960，4K 素材也按这个尺寸抠像。
