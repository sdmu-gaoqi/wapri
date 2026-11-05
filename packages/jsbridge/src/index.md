---
nav:
  title: jsbridge
  order: 4
title: 简介
group:
  order: 1
---

# jsbridge

`@wapri/gjsbridge` 是 iOS、Android 与鸿蒙 WebView 的统一桥接包。根入口 `src/index.ts` 通过 `createJSB()` 创建并导出唯一的 `jsbridge` 代理实例；`core/JSBNative` 只负责三端通道，且持有 `cb: new BridgeCB()`。`BridgeCB` 统一维护请求 ID、pending Map、超时、Native 响应和订阅事件。内部方法使用 JSDoc 标注职责与清理行为。业务只使用 `jsbridge.<具体方法名>(params)`，不接触底层通道方法。

可将以下代码放入到浏览器脚本中模拟app环境内

## 安装

```bash
pnpm add @wapri/gjsbridge
```

## Native 注入约定

Android 与鸿蒙需注入 `window.JSBridge.handle(message)`，接收 `{ method, params, requestId }`；iOS 按具体 Native 方法名注入 `window.webkit.messageHandlers[method].postMessage(message)`，接收 `{ params, requestId }`，不再在报文中重复传递 `method`。

```ts | pure
// Android / 鸿蒙
window.JSBridge.handle(
  JSON.stringify({
    method: 'closeWebview',
    params: {},
    requestId: 'BridgeHandle1',
  }),
)

// iOS
window.webkit.messageHandlers.closeWebview.postMessage(
  JSON.stringify({
    params: {},
    requestId: 'BridgeHandle1',
  }),
)
```

三端都通过下列回调把结果送回 JS：

```ts | pure
window.onNativeMessage(
  JSON.stringify({
    requestId: 'BridgeHandle1',
    code: 0,
    message: 'success',
    data: { token: '...' },
  }),
)

window.onNativeEvent('networkChanged', JSON.stringify({ online: true }))
```

> **通道名可配置。** 默认读取 `window.JSBridge.handle`，代理实例缓存在 `window.__sdkJSBridge`。
> 容器注入的名字不同（如 `window.YourBridge`）时，用 `createJSB({ nativeChannel: 'YourBridge', globalKey: '__yourBridge' })`
> 创建实例并调用返回值；模块默认导出的 `jsbridge` 始终使用默认配置。
>
> ```ts | pure
> import { createJSB } from '@wapri/gjsbridge'
>
> const bridge = createJSB({ nativeChannel: 'YourBridge', globalKey: '__yourBridge' })
> await bridge.webReady()
> ```

## 业务调用

Native 注入的 `window.JSBridge.handle(message)` 与 `window.webkit.messageHandlers[method].postMessage(message)` 都只是包的内部传输通道。业务直接调用 Native 方法名，包会自动生成 `requestId`、选择当前容器的通道、序列化请求并处理 `onNativeMessage` 回调。

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

const session = await jsbridge.psLoginSession<{ token: string }>({})
```

## API 总览

| 方法              | Native 方法        | 参数                              | 返回值                         | 说明                                  |
| ----------------- | ------------------ | --------------------------------- | ------------------------------ | ------------------------------------- |
| `canIUse`         | `permission.caniuse` | `{ api: ApiKeys }`                | `{ result: '0' \| '1' }`       | 检测容器是否支持指定 Native 方法。    |
| `getSafeArea`     | `getSafeArea`      | 无                                | `SafeAreaInfo`                 | 获取窗口安全区域。                    |
| `close`           | `closeWebview`     | 无                                | `undefined`                    | 关闭当前 WebView。                    |
| `makePhoneCall`   | `makePhoneCall`    | `{ phoneNumber: string }`         | `undefined`                    | 拨打指定号码。                        |
| `config`          | —                  | —                                 | `{ debug: boolean }`           | jsbridge 运行时配置。                 |
| `setDebug`        | —                  | `debug: boolean`                  | `void`                         | 设置是否输出原始通信数据。            |
| `on` / `once`     | —                  | `(eventName, listener)`           | `() => void`                   | 订阅 Native 事件，返回取消订阅函数。  |
| `off`             | —                  | `(eventName, listener)`           | `void`                         | 移除指定事件的监听函数。              |
| `webReady`        | —                  | 无                                | `boolean`                      | 检查 Native 通道是否已挂载。          |
| `destroy`         | —                  | 无                                | `void`                         | 销毁实例，拒绝未完成请求并清空订阅。  |

上表中「Native 方法」列是包内 `apiRegistry` 建立的映射，业务侧只使用第一列的方法名。除 `canIUse`、`close` 外，其余业务方法名与 Native 方法名一致。

`webReady()` 是本地同步检测，不会向 Native 发起请求。当 Native 已注入 Android/鸿蒙的 `window.JSBridge`，或 iOS 的 `window.webkit.messageHandlers` 时返回 `true`；两者均不存在时返回 `false`。该结果不受 JS 侧回调或 `destroy()` 影响。

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

if (jsbridge.webReady()) {
  // 可以调用 Native 方法
}
```

## 调试通信

`config` 是 `JSBNative` 实例上的配置，默认 `jsbridge.config.debug` 为 `false`。调用 `jsbridge.setDebug(true)` 后，会在控制台打印 JS 发送给 Native 的原始 JSON 字符串，以及 Native 调用 `onNativeMessage` 和 `onNativeEvent` 时传入的原始数据；日志可能包含业务敏感信息，仅建议在开发或问题排查时开启。

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

jsbridge.setDebug(true)

console.log(jsbridge.config.debug) // true
```

## 请求响应

每次业务调用都会自动生成 `requestId`、维护一次性事务，并在 Native 调用 `onNativeMessage` 后返回数据；默认超时为 10 秒。需要为某个方法设置其他超时时间，在 `packages/jsbridge/src/registers/index.ts` 的 `apiRegistry` 中配置其 `timeout`（单位：毫秒）。

```ts | pure
export const apiRegistry = {
  canIUse: {
    nativeMethod: 'permission.caniuse',
    // timeout: 15_000, // 可选：仅覆盖 canIUse，未配置时使用默认 10 秒
  },
  close: {
    nativeMethod: 'closeWebview',
  },
}
```

`initialParams` 会在发起调用时与业务参数合并，业务参数优先，因此业务侧无需重复传入 `userType` 这类固定参数。

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

const session = await jsbridge.psLoginSession<{ token: string }>({})
console.log(session.token)
```

当 Native 返回 `code !== 0` 时，Promise 会拒绝为 `BridgeError`；使用 `error.code` 获取 Native 错误码，使用 `error.message` 获取 Native 错误信息。超时、容器未注入或手动销毁导致的错误是普通 `Error`，没有 Native 错误码。`await/try-catch` 与 `then/catch` 两种写法完全等价。

```ts | pure
import { BridgeError, jsbridge } from '@wapri/gjsbridge'

try {
  await jsbridge.psLoginSession({})
} catch (error: unknown) {
  if (error instanceof BridgeError) {
    console.log(error.code) // Native 返回的 code
    console.log(error.message) // Native 返回的 message
  }
}
```

```ts | pure
import { BridgeError, jsbridge } from '@wapri/gjsbridge'

jsbridge
  .psLoginSession<{ token: string }>({})
  .then((session) => {
    console.log(session.token)
  })
  .catch((error: unknown) => {
    if (error instanceof BridgeError) {
      console.log(error.code) // Native 返回的 code
      console.log(error.message) // Native 返回的 message
    }
  })
```

## 订阅事件

`onNativeEvent(eventName, data)` 与请求响应完全分离，适合网络状态、推送和长连接等持续事件。Native 通过 `window.onNativeEvent(eventName, data)` 触发；`data` 为 JSON 字符串时包会自动解析为对象，解析失败则原样透传。

| 方法   | 签名                                                    | 说明                                     |
| ------ | ------------------------------------------------------- | ---------------------------------------- |
| `on`   | `on<TData>(eventName: string, listener): () => void`    | 持续订阅，返回取消订阅函数。             |
| `once` | `once<TData>(eventName: string, listener): () => void`  | 只触发一次，首次回调后自动取消订阅。     |
| `off`  | `off<TData>(eventName: string, listener): void`         | 移除指定事件上的某个监听函数。           |

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

const stop = jsbridge.on<{ online: boolean }>('networkChanged', ({ online }) => {
  console.log('网络状态', online)
})

// 只监听一次
jsbridge.once('appResume', () => {
  console.log('App 回到前台')
})

const handlePush = (payload: unknown) => console.log(payload)
jsbridge.off('pushMessage', handlePush)

// on / once 的返回值同样可以取消订阅
stop()
```

## 销毁实例

`destroy()` 会拒绝所有尚未完成的请求、清空事件订阅，并移除本实例挂载在 `window` 上的 `onNativeMessage` 与 `onNativeEvent` 回调，建议在页面卸载时调用。

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

jsbridge.destroy()
```

代理实例缓存在 `window.__sdkJSBridge` 上，同一页面重复导入返回同一实例；销毁后不会自动重建，因此不要在仍需使用桥接能力时提前调用 `destroy()`。

## 错误处理

| 错误类型      | 触发场景                                       | 可用信息                          |
| ------------- | ---------------------------------------------- | --------------------------------- |
| `BridgeError` | Native 返回 `code !== 0`。                     | `error.code`、`error.message`。   |
| `Error`       | 请求超时、容器未注入、实例已销毁、参数非对象。 | 仅 `error.message`，无 Native code。 |

```ts | pure
import { BridgeError, jsbridge } from '@wapri/gjsbridge'

try {
  await jsbridge.makePhoneCall({ phoneNumber: '10086' })
} catch (error: unknown) {
  if (error instanceof BridgeError) {
    console.log(error.name) // 'BridgeError'
    console.log(error.code) // Native 返回的 code
    console.log(error.message) // Native 返回的 message
  } else if (error instanceof Error) {
    console.log(error.message) // 'Native 请求超时' / 'Native 通道未就绪' / 'Native 已销毁'
  }
}
```

`BridgeError` 继承自 `Error`，`name` 固定为 `BridgeError`，`code` 为 Native 响应中的错误码。传入非对象参数时调用会直接以 `Error('jsbridge 参数必须是对象')` 拒绝，不会发起 Native 请求。

## 模拟

```js
// ==UserScript==
// @name         模拟jsbridge
// @namespace    https://docs.scriptcat.org/
// @version      0.1.0
// @description  try to take over the world!
// @author       You
// @match        http://localhost:8000/*
// @grant        none
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    window.JSBridge = {
        handle: (data) => {
            const requestData = JSON.parse(data)
            setTimeout(() => {
                window.onNativeMessage(JSON.stringify({
                    code: 0,
                    message: 'success',
                    data: {
                        time: +new Date()
                    },
                    requestId: requestData.requestId
                }))
            }, 1000)
        }
    }
    // Your code here...
})();

```

ios
```js
// ==UserScript==
// @name         模拟 iOS jsbridge
// @namespace    https://docs.scriptcat.org/
// @version      0.1.0
// @description  在 PC 浏览器中模拟 iOS WKWebView 的 window.webkit.messageHandlers 通道
// @author       You
// @match        http://*/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

/**
 * iOS 通道模拟器。
 *
 * 与 Android / 鸿蒙版本（注入 window.JSBridge.handle）的区别：
 * - iOS 的 Native 方法名是 messageHandlers 的**键**，报文里不再携带 method；
 * - 所以 messageHandlers 用 Proxy 实现，任意方法名都能拿到 postMessage；
 * - 请求体为 { params, requestId }，响应仍统一走 window.onNativeMessage。
 *
 * 需要匹配自己的调试域名时，改上面的 @match。
 */
(function () {
  'use strict'

  /** 同一页面只注入一次。 */
  if (window.__iOSBridgeMock) {
    return
  }

  const config = {
    /** 模拟原生往返耗时（毫秒）。真实 iOS 通过 evaluateJavaScript 异步回调，不会同步返回。 */
    delay: 300,
  }

  /** getSafeArea 的返回值。 */
  const SAFE_AREA = { safeAreaTop: 59, safeAreaBottom: 34, safeAreaLeft: 0, safeAreaRight: 0 }

  /** Native 当前已实现的 api 名单，决定 canIUse 的结果。 */
  const SUPPORTED_APIS = ['debug.demp']

  /**
   * key 必须是 Native 真实方法名（apiRegistry 里的 nativeMethod），不是业务侧方法名（canIUse / close）。
   *
   * 返回值约定：
   * - 返回普通对象 → 整体作为响应体里的 data；
   * - 返回 { code: number, message: string } → 视为完整响应体，可用来模拟失败；
   * - 返回 undefined → code 0 且 data 为空；
   * - 返回 Promise → 支持异步实现。
   */
  const routes = {
    /** 业务侧 jsbridge.canIUse({ api })，入参含 initialParams.userType。 */
    'permission.caniuse': ({ api }) => ({ result: SUPPORTED_APIS.includes(api) ? '1' : '0' }),

    /** 业务侧 jsbridge.getSafeArea()。 */
    getSafeArea: () => ({ ...SAFE_AREA }),

    /** 业务侧 jsbridge.close()，真实原生会关闭 WebView。 */
    closeWebview: () => {
      console.log('[iOS Bridge Mock] closeWebview：真实环境会关闭当前 WebView')
      return undefined
    },

    /** 业务侧 jsbridge.makePhoneCall({ phoneNumber })。 */
    makePhoneCall: ({ phoneNumber }) => {
      console.log('[iOS Bridge Mock] makePhoneCall：真实环境会调起拨号', phoneNumber)
      return undefined
    },
  }

  /** 运行期覆盖的路由，优先级高于 routes。 */
  const overrides = new Map()

  /** 已发生的调用记录，便于排查参数。 */
  const calls = []

  /** 把路由返回值归一化成 { code, message, data } 响应体。 */
  const respond = (requestId, result) => {
    const isEnvelope =
      result !== null &&
      typeof result === 'object' &&
      typeof result.code === 'number' &&
      typeof result.message === 'string'
    const { code, message, data } = isEnvelope ? result : { code: 0, message: 'success', data: result }

    if (typeof window.onNativeMessage !== 'function') {
      console.warn('[iOS Bridge Mock] window.onNativeMessage 尚未挂载（jsbridge 还没被引入），响应被丢弃', requestId)
      return
    }

    console.log('[iOS Bridge Mock] ← response', { requestId, code, message, data })
    window.onNativeMessage(JSON.stringify({ requestId, code, message, data }))
  }

  /**
   * 为一个 Native 方法创建 handler。
   * iOS 约定：postMessage 入参是 JSON 字符串 { params, requestId }，方法名由 handler 的键表达。
   */
  const createHandler = (method) => ({
    postMessage(raw) {
      let payload
      console.log(raw,'raw')

      try {
        payload = JSON.parse(raw)
      } catch {
        console.warn('[iOS Bridge Mock] 请求报文不是合法 JSON，已忽略', method, raw)
        return
      }

      if ('method' in (payload ?? {})) {
        console.warn(`[iOS Bridge Mock] ${method} 的报文携带了 method，这是 Android / 鸿蒙的格式`, payload)
      }

      const { params = {}, requestId } = payload ?? {}

      if (typeof requestId !== 'string') {
        console.warn('[iOS Bridge Mock] 请求缺少 requestId，无法回调响应', method, payload)
        return
      }

      calls.push({ method, params, requestId, at: Date.now() })
      console.log(`[iOS Bridge Mock] → ${method}`, params)

      setTimeout(() => {
        const route = overrides.get(method) ?? routes[method]

        if (typeof route !== 'function') {
          console.warn(`[iOS Bridge Mock] 未 mock 的原生方法：${method}，已返回 code 404`)
          respond(requestId, { code: 404, message: `[mock] 未实现的原生方法：${method}` })
          return
        }

        Promise.resolve()
          .then(() => route(params, { method, requestId }))
          .then((result) => respond(requestId, result))
          .catch((error) => {
            console.warn(`[iOS Bridge Mock] mock 实现抛出异常：${method}`, error)
            respond(requestId, { code: 500, message: `[mock] ${error?.message ?? error}` })
          })
      }, config.delay)
    },
  })

  /** 保留宿主已有的 window.webkit 属性，只覆盖 messageHandlers。 */
  const webkit = window.webkit ?? (window.webkit = {})

  /** 任意方法名都能拿到 handler，新增 Native 方法时无需改脚本。 */
  webkit.messageHandlers = new Proxy(
    {},
    {
      get(target, property) {
        if (typeof property !== 'string' || property === 'then' || property === 'constructor') {
          return undefined
        }

        return (target[property] ??= createHandler(property))
      },
    },
  )

  /**
   * 调试入口：
   *   __iOSBridgeMock.mock('getSafeArea', () => ({ safeAreaTop: 0, safeAreaBottom: 0, safeAreaLeft: 0, safeAreaRight: 0 }))
   *   __iOSBridgeMock.mock('xxx', () => __iOSBridgeMock.fail(4001, '模拟失败'))
   *   __iOSBridgeMock.emit('networkChanged', { online: true })
   *   __iOSBridgeMock.calls
   */
  window.__iOSBridgeMock = {
    routes,
    calls,
    config,

    mock(method, route) {
      overrides.set(method, route)
      return this
    },

    unmock(method) {
      overrides.delete(method)
      return this
    },

    /** 构造成功响应体，配合 mock 使用。 */
    ok(data) {
      return { code: 0, message: 'success', data }
    },

    /** 构造失败响应体，配合 mock 使用，JS 侧会拿到 BridgeError。 */
    fail(code, message) {
      return { code, message }
    },

    /** 主动下发一次 Native 事件，数据与原生一致以 JSON 字符串传递。 */
    emit(eventName, data) {
      if (typeof window.onNativeEvent !== 'function') {
        console.warn('[iOS Bridge Mock] window.onNativeEvent 尚未挂载，事件被丢弃', eventName)
        return
      }

      console.log(`[iOS Bridge Mock] ⇢ event ${eventName}`, data)
      window.onNativeEvent(eventName, JSON.stringify(data))
    },

    setDelay(milliseconds) {
      config.delay = milliseconds
      return this
    },
  }

  console.log('[iOS Bridge Mock] 已接管 window.webkit.messageHandlers')
})()

```
