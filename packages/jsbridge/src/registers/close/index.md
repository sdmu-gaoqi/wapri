---
title: close
group:
  title: 方法
  order: 3
---

# close

关闭当前 WebView 页面。

## 调用示例

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

jsbridge
  .close()
  .then(() => {
    console.log('Native 已接收关闭请求')
  })
  .catch((error) => {
    console.error(error)
  })
```

该方法不需要参数。Native 成功处理后，当前 WebView 页面会关闭。

## 返回值

Native 成功响应（`code === 0`）后 Promise 解析为 `undefined`；Native 拒绝时以 `BridgeError` 拒绝。

## 说明

业务方法名 `close` 与 Native 方法名不同，`apiRegistry` 将其映射为 `closeWebview`，业务侧只使用 `close` 即可。

```ts | pure
export const apiRegistry = {
  close: {
    nativeMethod: 'closeWebview',
  },
}
```
