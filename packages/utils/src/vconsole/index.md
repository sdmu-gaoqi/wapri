---
title: vconsole
group:
  title: 调试
  order: 1
---

# vconsole

`vconsole` 会按需加载 [Eruda](https://eruda.liriliri.io/)，用于在移动端页面中查看日志、网络请求和页面信息。重复调用仅会初始化一次；非浏览器环境会安全跳过。

## 如何使用

```ts | pure
import { vconsole } from '@wapri/gutils'

vconsole().catch((error) => {
  console.error('调试面板加载失败', error)
})
```

建议仅在开发或测试环境调用，避免将远程调试面板带入正式生产环境。
