---
title: getSafeArea
group:
  title: 方法
  order: 2
---

# getSafeArea

获取当前 WebView 窗口的安全区域信息，用于刘海屏、圆角屏与底部手势条的避让布局。

## 调用示例

```ts | pure
import { jsbridge } from '@wapri/gjsbridge'

jsbridge
  .getSafeArea()
  .then((safeArea) => {
    console.log(safeArea.safeAreaTop, safeArea.safeAreaBottom)
  })
  .catch((error) => {
    console.error(error)
  })
```

## 参数

该方法不需要参数。

## 返回值

| 参数           | 类型     | 说明                     |
| -------------- | -------- | ------------------------ |
| safeAreaTop    | `number` | 顶部安全区域高度，单位 px。 |
| safeAreaBottom | `number` | 底部安全区域高度，单位 px。 |
| safeAreaLeft   | `number` | 左侧安全区域宽度，单位 px。 |
| safeAreaRight  | `number` | 右侧安全区域宽度，单位 px。 |

```ts | pure
type SafeAreaInfo = Record<'safeAreaTop' | 'safeAreaBottom' | 'safeAreaLeft' | 'safeAreaRight', number>
```

## 说明

业务方法名 `getSafeArea` 与 Native 方法名一致，`apiRegistry` 中仅做显式登记，未注入 `initialParams`。
