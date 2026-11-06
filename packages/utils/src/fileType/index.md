---
title: fileType 文件类型识别
group:
  title: 基础
  order: 1
---

# fileType 文件类型识别

浏览器给 `File` 的 `type` 经常是空串或 `application/octet-stream`（尤其是 App WebView 里从本地选的文件），所以上传、预览前不能只信 `file.type`，需要读文件头判断。

## API

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `detectFileType(head, fileName?)` | `(ArrayBuffer \| Uint8Array, string?) => FileTypeInfo` | 按魔数识别，再按扩展名 / 文本特征兜底 |
| `getFileExtension(nameOrUrl)` | `(string) => string` | 取小写扩展名，忽略 query、hash 与路径 |

```ts
interface FileTypeInfo {
  category: 'pdf' | 'word' | 'xlsx' | 'ppt' | 'image' | 'text' | 'video' | 'audio' | 'unknown'
  mime: string
  extension: string
}
```

识别规则：

- 魔数命中：`%PDF` → pdf；`PK\x03\x04` 再扫描 OOXML 内部目录名，`word/` → docx、`xl/` → xlsx、`ppt/` → pptx
- 图片、音视频按魔数或扩展名
- 扩展名在文本白名单（`txt`、`md`、`json`、`csv`、`ts`、`vue` 等）内 → text
- 都不是时，若字节里几乎没有控制字符 → text，否则 unknown

## 示例

```ts
import { detectFileType, getFileExtension } from '@wapri/gutils'

const head = new Uint8Array(await file.slice(0, 8192).arrayBuffer())
const info = detectFileType(head, file.name)

info.category // 'pdf' | 'word' | 'xlsx' | 'text' | ...
getFileExtension('https://cdn.example.com/a/report.pdf?x=1') // 'pdf'
```

建议至少传前 8KB：zip 内部目录名不一定出现在文件最前面，样本太短时 docx / xlsx 会退化成 `unknown`。
