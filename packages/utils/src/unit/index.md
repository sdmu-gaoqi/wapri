---
title: toCssSize
group:
  title: 基础
  order: 1
---

# toCssSize

尺寸归一化：数字按 `px` 处理，字符串（`12rem` / `40%`）原样返回。组件接 `number | string` 的尺寸配置时，写进 CSS 变量前先过一遍。

## 如何使用

```typescript
import { toCssSize } from '@wapri/gutils'

toCssSize(120) // '120px'
toCssSize('8rem') // '8rem'
toCssSize('40%') // '40%'
```
