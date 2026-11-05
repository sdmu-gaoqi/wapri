---
title: lodash
group:
  title: 基础
  order: 1
---

# lodash

基于 `lodash-es` 的完整转发（`export * from 'lodash-es'`），并覆写了三个高频判断函数，修正了原版对边界值的处理：

| 函数        | 说明                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| `isEmpty`   | 增强版判空：`0` 与 `false` 视为合法值（原版 `isEmpty(0)` 返回 true）   |
| `isObject`  | 严格对象判断：`null` 与数组返回 `false`                                |
| `isNumber`  | 数字判断：排除 `NaN` 与 `Infinity`                                     |

## 如何使用

```typescript
import { isEmpty, isNumber, isObject, debounce } from '@wapri/gutils'

isEmpty('') // true
isEmpty([]) // true
isEmpty(0) // false（0 是合法值）
isEmpty(false) // false（false 是合法值）

isNumber(12) // true
isNumber('12') // false
isNumber(NaN) // false
isNumber(Infinity) // false

isObject({ a: 1 }) // true
isObject(null) // false
isObject([]) // false（数组不算对象）

// lodash-es 其余函数均可直接使用
const fn = debounce(() => {}, 300)
```