---
title: uuid
group:
  title: 基础
  order: 1
---

# uuid

随机 ID 生成，基于 `nanoid` 转发。

## 如何使用

```typescript
import { uuid } from '@wapri/gutils'

uuid() // => 'V1StGXR8_Z5jdHi6B-myT'

// 场景：临时 key、表单行 ID、上报追踪
const rowKey = uuid()
```

无需额外配置，默认生成 21 位 url-safe 随机字符串。