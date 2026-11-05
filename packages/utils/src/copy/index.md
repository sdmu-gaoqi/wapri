---
title: copy
group:
  title: 业务
  order: 2
---

# copy

复制文本到剪贴板，基于 `copy-to-clipboard`。

## 如何使用

```typescript
import { copy } from '@wapri/gutils'

copy('hello world!')

copy('链接已复制') // 配合消息提示使用
```