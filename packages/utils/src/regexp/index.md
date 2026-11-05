---
title: regexp
group:
  title: 基础
  order: 1
---

# regexp

常用格式校验。正则统一维护在 `@wapri/gbase` 的 `src/constant/regexp.ts`，由 `@wapri/gutils` 统一转出。

## API

| 方法             | 入参              | 返回      | 说明                                             |
| ---------------- | ----------------- | --------- | ------------------------------------------------ |
| `isEmail(value)` | `string \| null`  | `boolean` | 校验邮箱                                         |
| `isPhone(value)` | `string \| null`  | `boolean` | 校验手机号（中国大陆 11 位，1 开头，第二位 3-9） |

入参为空（`null` / `undefined`）时返回 `false`。

## 如何使用

```typescript
import { isEmail, isPhone } from '@wapri/gutils'

isEmail('user@example.com') // true
isPhone('13800138000') // true

isEmail('bad@') // false
isPhone('12800138000') // false
```

## 为什么正则用函数导出

`isEmail` / `isPhone` 内部调用的是 `regexpEmail()` / `regexpPhone()` 构造函数，而不是直接持有正则对象：

1. 正则字面量在**脚本解析阶段**就会被引擎校验，一旦浏览器不支持其中的语法（如 lookbehind），解析期就直接抛 `SyntaxError`，整个模块都加载不了，调用方连兜底的机会都没有。
2. 所以正则改用字符串 + `new RegExp`，把编译推迟到调用时；`isEmail` / `isPhone` 内部用 `try/catch` 包裹，构造或匹配失败时统一返回 `false`，不会把异常抛给业务。

需要 RegExp 对象本身（例如 Element Plus 表单的 `pattern`）时，从 `@wapri/gbase` 取构造函数：

```typescript
import { regexpEmail } from '@wapri/gbase'

const rules = [{ pattern: regexpEmail(), message: '邮箱格式不正确' }]
```

## 新增校验规则

1. 在 `@wapri/gbase` 的 `src/constant/regexp.ts` 增加 `regexpXxx()`，用字符串 + `new RegExp` 构造；
2. 在 `@wapri/gbase` 的 `src/regexp.ts` 增加对应的 `isXxx`，内部用 `try/catch`，异常返回 `false`；
3. 不要在业务里内联正则。
