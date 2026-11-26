---
title: createWorker 内联 Worker
group:
  title: 基础
  order: 3
---

# createWorker 内联 Worker

`CreateWorker` 继承原生 `Worker`，把主线程里声明的函数序列化成 Blob URL 后到 worker 内执行，省掉「单独建 worker 文件 + 配构建入口」这一步。

## 代码演示

<code src="./demo/index.vue" iframe></code>

## 如何使用

```ts
import { CreateWorker } from '@wapri/gutils'

/** 只能使用自身与 worker 全局对象，不能引用外部变量 */
const sumWorker = () => {
  self.onmessage = (event: MessageEvent<number>) => {
    let sum = 0
    for (let index = 0; index < event.data; index++) sum += index
    self.postMessage(sum)
  }
}

const worker = new CreateWorker(sumWorker)

worker.onmessage = (event: MessageEvent<number>) => {
  console.log(event.data)
}
worker.postMessage(1_000_000)
```

封装成 Promise 复用：

```ts
import { CreateWorker } from '@wapri/gutils'

const runInWorker = <T>(script: () => void, payload: unknown): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const worker = new CreateWorker(script)

    worker.onmessage = (event: MessageEvent<T>) => {
      resolve(event.data)
      worker.terminate()
    }
    worker.onerror = (event) => {
      reject(event)
      worker.terminate()
    }
    worker.postMessage(payload)
  })
```

## API

```ts
new CreateWorker(script, options?)
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `script` | `() => void` | 必填 | worker 脚本函数，`toString()` 后在 worker 内执行 |
| `options.type` | `'classic' \| 'module'` | `'classic'` | worker 类型 |
| `options.name` | `string` | — | worker 名字，便于 DevTools 里区分 |

实例就是原生 `Worker`：`postMessage`、`onmessage`、`onerror`、`addEventListener`、`terminate` 都按浏览器用法走。

## 注意

- 脚本函数会被 `toString()` 后独立执行，**不能引用闭包变量、`import` 进来的模块**，需要的数据通过 `postMessage` 传进去。
- 需要 `importScripts`、ESM 依赖或更细的 RPC 协议时，用同一包里的 `createInlineWorker` / `createWorkerFromUrl` 配合 `WorkerChannel`，见 [worker](/utils/worker)。
- 依赖 `Blob` 与 `URL.createObjectURL`，只在浏览器环境可用。
