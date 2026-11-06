---
title: file
group:
  title: 基础
  order: 1
---

# file

统一读取用户提供的文件来源：本地 `File` / `Blob`、内存 `ArrayBuffer` / `ArrayBufferView`、远程或 `data:` URL。

## API

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `readFileAsArrayBuffer(input, init?)` | `(FileInput, RequestInit?) => Promise<ArrayBuffer>` | 读取为 ArrayBuffer，字符串按 URL 处理 |
| `readFileAsText(input, encoding?, init?)` | `(FileInput, string?, RequestInit?) => Promise<string>` | 读取为文本，默认 `utf-8`，BOM 由 TextDecoder 处理 |
| `readFileAsBlob(input, mime?)` | `(FileInput, string?) => Promise<Blob>` | 读取为 Blob，Buffer 来源需要显式传 MIME |
| `getFileName(input, fallback?)` | `(FileInput, string?) => string` | 取文件名，URL 会去掉 query、hash 并 decode |
| `getFileSize(input)` | `(FileInput) => number` | 读取体积，无法直接得知时返回 0 |
| `isFileUrl(value)` | `(string) => boolean` | 是否是 `fetch` 能直接处理的地址 |

`FileInput = Blob | ArrayBuffer | ArrayBufferView | string`。

## 示例

```ts
import { getFileName, readFileAsArrayBuffer, readFileAsText } from '@wapri/gutils'

// 本地文件
const buffer = await readFileAsArrayBuffer(file)

// 远程文件（可带请求头）
const remote = await readFileAsArrayBuffer('/files/report.pdf', {
  headers: { Authorization: 'Bearer token' },
})

// 纯文本
const text = await readFileAsText(file, 'utf-8')

console.log(getFileName('https://cdn.example.com/a/b/报告.pdf?x=1')) // 报告.pdf
```

远程请求失败时抛错，错误信息包含状态码；非 `http(s)`、`data:`、`blob:` 的字符串在 `readFileAsText` 中会被当作文本内容直接返回。
