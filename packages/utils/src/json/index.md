---
title: json
group:
  title: 基础
  order: 1
---

# json

安全 JSON 工具：解析失败不抛错、空值安全转字符串。

## API

| 函数                    | 说明                                                            |
| ----------------------- | --------------------------------------------------------------- |
| `tryParse(value, backstop)` | 安全解析 JSON：解析失败返回 `backstop` 兜底值                 |
| `safeString(data)`      | 安全转字符串：`null` / `undefined` 返回 `''`，其余走 `String()` |

## 如何使用

```typescript
import { tryParse, safeString } from '@wapri/gutils'

// 安全解析：后端返回的字符串字段可能不是合法 JSON
tryParse('{"a":1}', {}) // => { a: 1 }
tryParse('not-json', {}) // => {}（解析失败返回兜底值）
tryParse(undefined as any, {}) // => undefined（原样返回）

// 安全转字符串：避免 "null" / "undefined" 文案
safeString(null) // => ''
safeString(undefined) // => ''
safeString(0) // => '0'
safeString({ a: 1 }) // => '[object Object]'
```