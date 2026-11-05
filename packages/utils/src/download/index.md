---
title: download
group:
  title: 业务
  order: 2
---

# download

浏览器端文件下载工具：Blob 落盘 + Blob 转 JSON（用于解析下载接口返回的业务错误）。

## API

| 函数                    | 说明                                                |
| ----------------------- | --------------------------------------------------- |
| `downloadBlob(name, blob)` | 将 Blob 对象下载为文件（兼容 IE10+）              |
| `blobToJson(blob)`      | 将 Blob 内容解析为 JSON（FileReader + TextDecoder） |

## 如何使用

```typescript
import { blobToJson, downloadBlob } from '@wapri/gutils'

// 2. 后端以 JSON 返回业务错误时，把 blob 解析出来
try {
  const blob = await request('/api/export', { responseType: 'blob' })
  // success
  downloadBlob(blob)
  // error
  const json = await blobToJson(blob) // 业务错误时这里能拿到 { code, msg }
  console.log(json)
} catch (e) {
  // 真正的网络错误走 catch
}
```