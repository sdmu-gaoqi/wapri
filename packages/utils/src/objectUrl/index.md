---
title: objectUrl
group:
  title: 基础
  order: 1
---

# objectUrl

Object URL 生命周期管理。预览、下载、音视频场景常用 `URL.createObjectURL`，忘记 `revoke` 会让 Blob 一直驻留内存；统一登记后可以集中释放。

## API

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `createObjectUrl(source)` | `(Blob \| MediaSource) => string` | 创建并登记一个 Object URL |
| `revokeObjectUrl(url)` | `(string) => void` | 释放单个 URL，未登记时静默返回 |
| `revokeAllObjectUrls()` | `() => void` | 释放全部登记的 URL，页面切换时调用 |
| `getObjectUrlCount()` | `() => number` | 已登记但未释放的数量，用于排查泄漏 |

## 示例

```ts
import { createObjectUrl, revokeAllObjectUrls, revokeObjectUrl } from '@wapri/gutils'

const url = createObjectUrl(file)

// 用在 <img src>、<video src> 或下载链接上
preview.src = url

// 组件卸载时释放
revokeObjectUrl(url)

// 路由切换时兜底清空
revokeAllObjectUrls()
```

只释放通过 `createObjectUrl` 登记过的地址；直接调用原生 `URL.createObjectURL` 创建的地址不受管理。
