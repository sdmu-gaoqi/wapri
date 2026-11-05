---
title: sleep
group:
  title: 基础
  order: 1
---

# sleep

Promise 延时函数，常用于重试间隔、轮询、模拟接口耗时。

## 如何使用

```typescript
import { sleep } from '@wapri/gutils'

async function retry() {
  for (let i = 0; i < 3; i++) {
    try {
      return await fetchData()
    } catch {
      await sleep(1000) // 失败后等待 1s 再重试
    }
  }
}
```