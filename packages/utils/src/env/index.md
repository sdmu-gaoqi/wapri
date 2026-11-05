---
title: env
group:
  title: 基础
  order: 1
---

# env

环境标识枚举，与各构建环境约定一致。

## 枚举值

| 枚举    | 值      |
| ------- | ------- |
| `Env.DEV`  | `dev` |
| `Env.TEST` | `test` |
| `Env.PRE`  | `pre` |
| `Env.PROD` | `prod` |

## 如何使用

```typescript
import { Env } from '@wapri/gutils'

const env = import.meta.env.MODE
if (env === Env.DEV) {
  // 本地开发逻辑
}
```