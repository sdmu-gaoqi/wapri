---
nav:
  title: utils
  order: 1
title: 简介
group:
  order: -10
---

# utils

utils，是一个面向业务封装的`函数库`。

## 基础依赖

除业务函数外，`@wapri/gutils` 也透出 `@wapri/gbase` 的基础依赖，业务里不需要重复安装：

| 依赖 | 用法 | 对应页面 |
| --- | --- | --- |
| `lodash-es` | `import { debounce } from '@wapri/gutils'` | `lodash` |
| `dayjs` | `import { dayjs } from '@wapri/gutils'` | `dayjs` |
| `fuse.js` | `import { Fuse } from '@wapri/gutils'` | `fuse.js` |
| `screenfull` | `import { screenfull } from '@wapri/gutils'` | `screenfull` |
| `js-cookie` | 通过 `cookie` / `new MyStorage('cookie')` 使用 | `storage` |

## 加密与签名

`aesEncrypt` / `aesDecrypt` / `getSign` 同样从 `@wapri/gbase` 透出（底层是 `crypto-js`），用法与密钥约定见 [aes](/utils/aes)。

```ts
import { aesDecrypt, aesEncrypt, getSign } from '@wapri/gutils'

const cipher = aesEncrypt('hello', '0123456789abcdef')
aesDecrypt(cipher, '0123456789abcdef')

getSign({ b: 2, a: 'x y' }, 'secret')
```

## 安装

```bash
pnpm add @wapri/gutils
```

## 使用示例

```typescript
import { copy } from '@wapri/gutils';

const msg = 'hello world!';
const copyData = copy(msg);
```