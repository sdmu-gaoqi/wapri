# @wapri/gbase

与框架无关的前端基础能力包：浏览器存储封装、运行环境（含鸿蒙）判断、正则校验、AES 加解密与签名、全屏切换，以及 `lodash-es`、`dayjs`、`fuse.js` 等基础依赖的统一出口。

## 在线文档

https://sdmu-gaoqi.github.io/wapri/changelog/base

## 模糊搜索（Fuse）

`fuse.js` 从 `@wapri/gbase` 统一导出，业务里不用再单独装它：

```ts
import { Fuse } from '@wapri/gbase'
import type { IFuseOptions } from '@wapri/gbase'

const options: IFuseOptions<{ name: string }> = { keys: ['name'] }
const fuse = new Fuse([{ name: 'wapri' }], options)

fuse.search('wap') // [{ item: { name: 'wapri' }, refIndex: 0, score: ... }]
```

同时导出了 `IFuseOptions`、`FuseOptionKey`、`FuseResult`、`FuseResultMatch`、`FuseSearchOptions`、`FuseIndex` 等常用类型。

## 全屏（screenfull）

`screenfull` 从 `@wapri/gbase` 统一导出，业务里不用再单独装它。日常开关全屏用 `fullscreen` 即可，省掉 `isEnabled` 判断：

```ts
import { fullscreen } from '@wapri/gbase'

await fullscreen.on() // 开启全屏，环境不支持时返回 false
await fullscreen.off() // 关闭全屏，本来不在全屏时返回 false
await fullscreen.switch() // 切换，返回切换后是否全屏

await fullscreen.on(document.querySelector('.player')!) // 只全屏某个元素
```

需要监听变化、拿全屏元素或传 `FullscreenOptions` 时用原始的 `screenfull`：

```ts
import { screenfull } from '@wapri/gbase'

if (screenfull.isEnabled) {
  await screenfull.request()
  await screenfull.exit()
}

screenfull.on('change', () => {
  console.log(screenfull.isFullscreen)
})
```

同时导出了 `ScreenfullEventName`（`'change' | 'error'`）与 `ScreenfullRawEventNames` 类型。

## AES 加解密与签名

基于 `crypto-js` 的 AES-CBC 加解密与 HmacMD5 参数签名：

```ts
import { aesDecrypt, aesEncrypt, getSign } from '@wapri/gbase'

const key = '0123456789abcdef' // 16 / 24 / 32 位
const cipher = aesEncrypt('hello', key) // Base64 密文
aesDecrypt(cipher, key) // 'hello'

// 按参数名升序拼 key=encodeURIComponent(value)，再做 HmacMD5
getSign({ b: 2, a: 'x y', sign: 'ignored' }, 'secret', ['sign'])
```

约定：

- `aesEncrypt` / `aesDecrypt` 是 AES-CBC + PKCS7，`key` 按 UTF-8 解析，长度必须是 16 / 24 / 32 个字节；IV 取 `key` 前 16 个字符，不单独传。
- 密文输出是 **Base64**（内部先取 hex 再转 Base64），不是 hex；密钥不一致时解密可能得到空串或抛 `Malformed UTF-8 data`，需要调用方兜底。
- `getSign(params, secretKey, excludeKeys?)` 会跳过 `excludeKeys` 与空值（`''`、`null`、`undefined`、空数组 / 空对象，数字 `0` 也算空值），值先 `encodeURIComponent` 再把 `*` 换成 `%2A`，最后返回 `HmacMD5` 的十六进制串。

## Storage

`MyStorage` 创建时先检查对应浏览器存储是否可用，并在不可用时回退到内存，避免 App 壳或非浏览器环境的读写异常。`StorageType` 支持 `localStorage`、`sessionStorage` 和 `cookie`。

```ts
import storage, { cookie, MyStorage, session } from '@wapri/gbase'

storage.setItem('token', 'value')
session.setItem('step', '2')

// cookie 走 js-cookie，默认 path=/，浏览器不可用时同样回退到内存
cookie.setItem('theme', 'dark')

const cookieStorage = new MyStorage('cookie')
cookieStorage.getItem('theme')
```

`storage` 是 `new MyStorage('localStorage')` 的默认实例；`session` 与 `cookie` 是另外两个预置实例。`cookie.clear()` 会删除当前 path 下可读写的所有 cookie。

## 运行环境判断（os）

统一从 `@wapri/gbase` 导入 `os`，不要在业务里内联 UA 正则。

```ts
import { os } from '@wapri/gbase'

os.isHarmonyOS() // 是否为鸿蒙（纯血鸿蒙 + 旧版鸿蒙）
os.getOS() // 'mac' | 'windows' | 'linux' | 'ios' | 'android' | 'harmonyos' | undefined
```

### 鸿蒙相关方法

| 方法                    | 说明                                                     |
| ----------------------- | -------------------------------------------------------- |
| `isHarmonyOS()`         | 广义鸿蒙：纯血鸿蒙 + 旧版鸿蒙                             |
| `isHarmonyOSNext()`     | 仅纯血鸿蒙（HarmonyOS NEXT 5.x）                          |
| `isHarmonyOSLegacy()`   | 仅旧版鸿蒙（HarmonyOS 4 及以前，兼容 AOSP，可装安卓 APK） |
| `getOS()`               | 返回 `'harmonyos'`                                        |

### 两类鸿蒙的 UA 差异

| 类型             | UA 关键特征                                       | `isAndroid()` |
| ---------------- | ------------------------------------------------- | ------------- |
| 纯血鸿蒙 NEXT    | `Phone; OpenHarmony 5.0`、`ArkWeb/4.1.6.1`，无 `Android` | `false`       |
| 旧版鸿蒙（≤ 4）  | `Android 10; HarmonyOS`、`HMSCore`，含 `Android`  | `true`        |

```txt
// 纯血鸿蒙系统浏览器
Mozilla/5.0 (Phone; OpenHarmony 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 ArkWeb/4.1.6.1 Mobile HuaweiBrowser/5.0.3.351

// 旧版鸿蒙
Mozilla/5.0 (Linux; Android 10; HarmonyOS; LIO-AL10; HMSCore 6.3.0.311) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.105 Mobile Safari/537.36
```

需要注意：

- **判断顺序**：旧版鸿蒙兼容 AOSP，`isAndroid()` 对它同样返回 `true`。需要区分时先判断 `isHarmonyOS()`，不要只用 `isAndroid()`。
- **不要用 `HMSCore` 判定鸿蒙**：它是华为移动服务的 SDK 标识，普通华为安卓机（如 Mate 系列）的 UA 里同样带有，会把所有华为安卓机误判成鸿蒙。
- UA 正则统一维护在 `src/constant/os.ts`，新增规则时先补正则再暴露方法。

## 正则校验

正则统一维护在 `src/constant/regexp.ts`，校验方法放在 `src/regexp.ts`。新增规则时先补正则，再暴露对应的 `isXxx` 方法，不要在业务里内联正则。

```ts
import { isEmail, isPhone } from '@wapri/gbase'

isEmail('user@wapri.com') // true
isPhone('13800138000') // true
```

| 方法      | 说明                     |
| --------- | ------------------------ |
| `isEmail` | 邮箱                     |
| `isPhone` | 手机号（中国大陆 11 位） |

### 为什么正则不直接导出

`src/constant/regexp.ts` 导出的是构造函数（`regexpEmail()`、`regexpPhone()`），而不是正则对象，原因有两点：

1. 正则字面量在**脚本解析阶段**就会被引擎校验，一旦浏览器不支持其中的语法（如 lookbehind），解析期就直接抛 `SyntaxError`，整个模块都加载不了，调用方连兜底的机会都没有。
2. 所以正则改用字符串 + `new RegExp`，把编译推迟到调用时；`isEmail` / `isPhone` 内部已用 `try/catch` 包裹，构造或匹配失败时统一返回 `false`，不会把异常抛给业务。

需要 RegExp 对象本身（例如 Element Plus 表单的 `pattern`）时，再显式调用构造函数：

```ts
import { regexpEmail } from '@wapri/gbase'

const rules = [{ pattern: regexpEmail(), message: '邮箱格式不正确' }]
```
