---
title: aes 加解密与签名
group:
  title: 基础
  order: 1
---

# aes 加解密与签名

基于 `crypto-js` 的 AES-CBC 加解密与 HmacMD5 参数签名，从 `@wapri/gbase` 导出，`@wapri/gutils` 直接透出，业务里不用再装 `crypto-js`。

## AES 加解密

```ts
import { aesDecrypt, aesEncrypt } from '@wapri/gutils'

const key = '0123456789abcdef' // 16 / 24 / 32 位
const cipher = aesEncrypt('hello 世界', key) // Base64 密文
aesDecrypt(cipher, key) // 'hello 世界'
```

与后端对齐时需要一致的三件事：

| 项 | 取值 |
| --- | --- |
| 算法 / 模式 | `AES-128-CBC`（`key` 为 24 / 32 字节时是 192 / 256） |
| 填充 | `PKCS7` |
| IV | `key` 的前 16 个字符，不再单独传 |

另外两个容易踩的点：

- `key` 按 UTF-8 解析，长度必须是 16 / 24 / 32 个**字节**；长度不对时 `crypto-js` 不会报错，但算出来的密文和后端对不上。
- 返回值是 **Base64**（内部先取 hex 密文再转 Base64），不是 hex 字符串。
- 密文被改动或 `key` 不一致时，`aesDecrypt` 可能返回空串，也可能抛 `Malformed UTF-8 data`，调用方需要 `try/catch` 兜底。

## 参数签名

```ts
import { getSign } from '@wapri/gutils'

getSign({ b: 2, a: 'x y', sign: 'ignored' }, 'secret', ['sign'])
// 等价于 HmacMD5('a=x%20y&b=2', 'secret')
```

规则：

- 按参数名 ASCII 升序排列；
- 跳过 `excludeKeys` 里的字段，以及空值：`''`、`null`、`undefined`、空数组、空对象，**数字 `0` 也会被当成空值跳过**（内部用 lodash `isEmpty` 判断）；
- 值先 `encodeURIComponent`，再把 `*` 换成 `%2A`；
- 用 `&` 拼成 `a=x%20y&b=2`，再算 `HmacMD5(message, secretKey)`。

## API

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| `aesEncrypt(input, key)` | AES-CBC 加密 | Base64 密文 |
| `aesDecrypt(input, key)` | 解密 Base64 密文 | UTF-8 明文 |
| `getSign(params, secretKey, excludeKeys?)` | 参数签名，`params` 的值支持 `string` / `number` | 32 位小写 hex |

## 注意

- 加解密和签名都是同步方法，不要放在渲染函数里反复执行。
- 密钥不要写死在业务代码里，走后端下发或环境配置。
