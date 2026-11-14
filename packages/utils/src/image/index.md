---
title: image
group:
  title: 基础
  order: 1
---

# image

火山引擎 TOS 图片处理的地址构造函数。TOS 的处理能力挂在地址的 `x-tos-process` 参数上，服务端实时处理、不落存储，前端拼好参数就能完成压缩、转质量、转格式。

## API

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `withTosImageProcess(url, options?)` | `(string, TosImageProcessOptions?) => string` | 给图片地址加处理参数，返回新地址 |
| `buildTosImageProcess(options?)` | `(TosImageProcessOptions?) => string` | 只拼处理串，自行控制参数位置时用 |
| `getTosImageProcess(url)` | `(string) => string` | 读取地址上已有的处理串 |
| `removeTosImageProcess(url)` | `(string) => string` | 去掉处理参数，还原原图地址 |

`TosImageProcessOptions`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `width` / `height` | `number` | 目标宽高，1 - 16384；只给一边时服务端按原图比例推算另一边 |
| `longEdge` / `shortEdge` | `number` | 目标长边 / 短边，宽高都不传时生效，适合「限最长边」的缩略图 |
| `resizeMode` | `'lfit' \| 'mfit' \| 'fill' \| 'pad' \| 'fixed'` | 缩放模式，默认 `lfit` |
| `quality` | `number` | 质量，1 - 100 |
| `qualityType` | `'absolute' \| 'relative'` | 默认 `absolute`；`relative` 只对 jpg / pjpeg 生效 |
| `format` | `'webp' \| 'avif' \| 'heic' \| ...` | 目标格式 |
| `autoOrient` | `boolean` | 按 Exif 方向自动旋转，默认 `false` |

## 示例

```ts
import { withTosImageProcess, removeTosImageProcess } from '@wapri/gutils'

// 压缩：只降质量
withTosImageProcess(url, { quality: 70 })

// 列表缩略图：限最长边并转 webp
withTosImageProcess(url, { longEdge: 300, format: 'webp' })

// 等比裁切成正方形
withTosImageProcess(url, { width: 200, height: 200, resizeMode: 'fill' })

// 已带处理串的地址会整体替换，其余参数与 hash 保留
withTosImageProcess('https://cdn.example.com/a.jpg?v=2#top', { width: 300 })
// https://cdn.example.com/a.jpg?v=2&x-tos-process=image/resize,w_300#top

// 还原原图
removeTosImageProcess(url)
```

## 注意

- 处理串顺序固定为「自适应方向 → 缩放 → 质量 → 格式」，格式转换放最后，保证输出的是目标格式。
- 目标尺寸大于原图时默认不放大、直接返回原图，小图不会被拉糊。
- `width` / `height` 优先于 `longEdge` / `shortEdge`，同时传时以宽高为准。
- `quality` 对 png / gif / bmp / tiff 不生效，这些格式要压体积优先转 `webp`。
- 私有桶的预签名 URL 已带签名，直接拼参数会导致校验失败，需要服务端按处理参数签名。
- 非 `http(s)` 地址（`data:`、`blob:`、相对路径）原样返回，不做处理。
