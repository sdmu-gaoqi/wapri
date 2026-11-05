---
title: emitter
group:
  title: 基础
  order: 1
---

# emitter

事件总线，基于 `mitt` 转发，跨组件 / 跨模块通信的轻量方案（约 200 字节，无依赖）。

## 如何使用

```typescript
import { emitter } from '@wapri/gutils'

const bus = emitter()

// 订阅
const handler = (payload) => {
  console.log('收到事件', payload)
}
bus.on('refresh', handler)

// 发布
bus.emit('refresh', { id: 1 })

// 取消订阅
bus.off('refresh', handler)

// 清空所有事件
bus.all.clear()
```

## 说明

- `emitter` 是工厂函数，每次调用返回独立的事件总线实例，互不干扰
- 支持通配符订阅 `bus.on('*', handler)` 监听全部事件
- 支持多个事件一次订阅 `bus.on(['a', 'b'], handler)`