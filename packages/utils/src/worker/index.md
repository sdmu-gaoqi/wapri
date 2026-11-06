---
title: worker
group:
  title: 基础
  order: 1
---

# worker

Worker 创建与主线程 RPC 通道。预览、大文件解析、批量计算这类重任务可以丢进 worker，主线程只收结果。

## API

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `createInlineWorker(source, options?)` | `(string, CreateWorkerOptions) => Worker` | 用脚本源码创建 classic worker，源码里可以用 `importScripts` 加载 UMD 资源 |
| `createWorkerFromUrl(url, options?)` | `(string \| URL, CreateWorkerOptions) => Worker` | 用入口地址创建 worker，默认 `type: 'module'` |
| `WorkerChannel` | class | 主线程 RPC 通道，封装请求、进度、错误与终止 |

`CreateWorkerOptions` 支持 `type: 'classic' | 'module'` 与 `name`。

### WorkerChannel

| 方法 | 说明 |
| --- | --- |
| `request(task, options?)` | 发送 `{ type, payload }`，返回 Promise；`options.timeout` 默认 60 秒，`<= 0` 表示不限时；`options.onProgress` 接收 worker 的进度消息 |
| `on(type, listener)` | 监听 worker 主动推送的消息，返回取消函数 |
| `terminate()` | 终止 worker 并拒绝所有未完成任务 |

worker 侧接收 `{ id, type, payload }`，回传以下三种消息之一：

```ts
{ id, type: 'result', payload }
{ id, type: 'error', error: 'message' }
{ id, type: 'progress', progress: 0.5 }
```

## 示例

```ts
import { createInlineWorker, WorkerChannel } from '@wapri/gutils'

const worker = createInlineWorker(`
self.onmessage = (event) => {
  const { id, payload } = event.data
  self.postMessage({ id, type: 'result', payload: payload * 2 })
}
`)

const channel = new WorkerChannel(worker)
const result = await channel.request<number>({ type: 'double', payload: 21 }, { timeout: 5000 })

channel.terminate()
```

内联 worker 的 Blob URL 会在启动 30 秒后自动释放；需要长期复用时，优先用 `createWorkerFromUrl` 指向可缓存的脚本地址。
