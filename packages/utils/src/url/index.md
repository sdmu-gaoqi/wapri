---
title: url
group:
  title: 业务
  order: 2
---

# url

URL 参数工具：对象序列化 / 参数解析 / 参数移除 / 地址替换。

## API

| 函数                              | 说明                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| `obj2url(obj)`                    | 对象序列化为 query string：空值自动跳过、对象自动 JSON 化、URL 编码 |
| `getUrlParam(key?, params?)`      | 解析参数：传 `key` 取单个值，不传返回全部；可指定 `params` 字符串  |
| `removeUrlParams(keys)`           | 移除当前 URL 上的指定参数（浏览器环境）                            |
| `replaceUrl(params, url?)`        | 合并参数并通过 `history.replaceState` 改写地址，不刷新页面，返回新地址 |

## 如何使用

```typescript
import { getUrlParam, obj2url, replaceUrl } from '@wapri/gutils'

// 对象 → query string（空值自动跳过，对象自动 JSON 化）
obj2url({ page: 1, size: 20, keyword: 'wa', filter: { status: 1 } })
// => page=1&size=20&keyword=wa&filter=%7B%22status%22%3A1%7D

// 解析参数
getUrlParam('page', '?page=1&size=20') // => '1'
getUrlParam(undefined, '?page=1&size=20') // => { page: '1', size: '20' }

// 移除当前地址栏参数（浏览器环境）
removeUrlParams(['page'])

// 合并参数改写地址，不刷新页面（hash 路由同样支持）
replaceUrl({ page: 2, keyword: 'wa' })
// https://a.com/list?page=1&size=20 => https://a.com/list?page=2&size=20&keyword=wa

// 传 null / undefined / '' 删除对应参数
replaceUrl({ size: null })
// https://a.com/list?page=2&size=20 => https://a.com/list?page=2

// 改写 hash 路由地址
replaceUrl({ id: 1 }, 'https://a.com/#/detail')
// => https://a.com/#/detail?id=1
```