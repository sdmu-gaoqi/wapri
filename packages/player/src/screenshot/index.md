---
title: 截图
group:
  title: 内置插件
  order: 4
---

# 截图 `screenshot`

点右侧菜单里的截图，按配置的格式与质量重绘当前帧并下载，同时抛出 `screenshot` 事件。

截图走 canvas 重绘，**视频源必须允许跨域**，否则画布被污染、`toDataURL` 会报错，此时控制台给出警告并在播放器上提示失败。画面调节插件的滤镜值会被一起画进截图。

<code src="./demo/basic.vue"></code>

## 配置

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `filename` | 文件名前缀，最终为 `${filename}_${播放时间}.${后缀}` | `string` | `'screenshot'` |
| `type` | 图片格式 | `'image/png' \| 'image/jpeg' \| 'image/webp'` | `'image/png'` |
| `quality` | 图片质量 0–1，仅 jpeg / webp 生效 | `number` | `0.92` |
| `download` | 是否直接下载；`false` 时只回调 | `boolean` | `true` |
| `onCapture` | 截图完成回调，拿到 dataURL 与时间点 | `(result: ScreenshotResult) => void` | - |

## 用法

```ts
plugins: [
  'screenshot',
  // 只回调不下载，业务自己保存
  pluginEntry('screenshot', (config) => ({
    ...config,
    filename: 'cover',
    type: 'image/jpeg',
    download: false,
    onCapture: ({ dataUrl, time }) => console.log(dataUrl, time),
  })),
]
```
