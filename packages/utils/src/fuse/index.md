---
title: fuse.js
group:
  title: 基础
  order: 1
---

# fuse.js

`fuse.js` 从 `@wapri/gutils` 统一透出（底层来自 `@wapri/gbase`），业务里不用再单独安装。适合做前端列表、命令面板、搜索框的模糊匹配。

## 如何使用

```ts
import { Fuse } from '@wapri/gutils'
import type { FuseResult, IFuseOptions } from '@wapri/gutils'

interface Command {
  name: string
  keywords: string[]
}

const commands: Command[] = [
  { name: '打开设置', keywords: ['settings', 'preference'] },
  { name: '新建文件', keywords: ['new', 'file'] },
]

const options: IFuseOptions<Command> = {
  keys: ['name', 'keywords'],
  threshold: 0.3,
}

const fuse = new Fuse(commands, options)
const result: FuseResult<Command>[] = fuse.search('setting')

result[0]?.item.name // '打开设置'
```

## 常用配置

| 配置        | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| `keys`      | 参与搜索的字段，支持字符串或带 `weight` 的对象               |
| `threshold` | 匹配阈值，`0` 最严格、`1` 最宽松，常用 `0.3` 左右            |
| `includeScore` | 结果里带上 `score`，便于排序或过滤                        |
| `includeMatches` | 结果里带上匹配下标，便于高亮                            |
| `minMatchCharLength` | 忽略过短的匹配片段                                 |

## 导出类型

| 类型 | 说明 |
| --- | --- |
| `IFuseOptions` | 构造 `Fuse` 的配置 |
| `FuseOptionKey` | `keys` 里的单个字段配置 |
| `FuseResult` | 单条搜索结果 |
| `FuseResultMatch` | 命中字段与匹配下标 |
| `FuseSearchOptions` | `search` 的第二个参数 |
| `FuseIndex` | 预建索引类型 |

> 大数据量、需要反复搜索时，可以用 `Fuse.createIndex` 预建索引，再传给 `new Fuse(list, options, index)`。
