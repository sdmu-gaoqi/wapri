---
title: makePhoneCall
group:
  title: 方法
  order: 4
---

# makePhoneCall

唤起系统拨号能力，拨打指定电话号码。

## 调用示例

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

jsbridge
  .makePhoneCall({ phoneNumber: '10086' })
  .then(() => {
    console.log('Native 已接收拨号请求')
  })
  .catch((error) => {
    console.error(error)
  })
```

## 参数

| 参数        | 类型     | 说明                 |
| ----------- | -------- | -------------------- |
| phoneNumber | `string` | 需要拨打的电话号码。 |

## 返回值

Native 成功响应（`code === 0`）后 Promise 解析为 `undefined`；号码非法或 Native 拒绝时以 `BridgeError` 拒绝。

## 说明

业务方法名 `makePhoneCall` 与 Native 方法名一致，`apiRegistry` 中仅做显式登记，未注入 `initialParams`，因此只会把业务传入的 `phoneNumber` 交给 Native。
