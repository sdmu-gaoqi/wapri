---
title: currency 金额处理
group:
  title: 业务
  order: 2
---

# currency 金额处理

`currency` 是从 `@wapri/gbase` 转发的金额处理方法，使用整数精度保存金额，避免直接使用 JavaScript 浮点数运算造成的精度问题。

## 代码演示

输入金额、货币符号和精度，实时查看格式化结果、最小货币单位转换以及金额运算结果。

<code src="./demo/basic.vue" iframe></code>

## 如何使用

```typescript
import { currency } from '@wapri/gutils'

const amount = currency('1234.56', { symbol: '¥' })

amount.format() // ¥1,234.56
amount.value // 1234.56
amount.intValue // 123456，按 precision=2 转换为分

const restored = currency(123456, { fromCents: true, symbol: '¥' })
restored.format() // ¥1,234.56
```

## 金额运算

金额实例是不可变的，`add`、`subtract`、`multiply`、`divide` 和 `distribute` 都会返回新的金额实例。

```typescript
const subtotal = currency('123.50')

subtotal.add('0.23').format() // $123.73
subtotal.subtract('0.50').format() // $123.00
subtotal.multiply(3).format() // $370.50
subtotal.distribute(3).map((item) => item.format()) // ['$41.17', '$41.17', '$41.16']
```

## API

### 创建金额实例

```typescript
currency(value, options?)
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `number \| string \| Currency` | 元金额、金额字符串或已有金额实例 |
| `options` | `CurrencyOptions` | 格式化及精度配置 |

### 实例方法与属性

| 名称 | 返回值 | 说明 |
| --- | --- | --- |
| `format(options?)` | `string` | 按配置格式化金额 |
| `value` | `number` | 元金额数值 |
| `intValue` | `number` | 按精度换算后的最小货币单位，如分 |
| `dollars()` | `number` | 整数部分 |
| `cents()` | `number` | 小数部分对应的最小货币单位 |
| `add(value)` | `Currency` | 加法 |
| `subtract(value)` | `Currency` | 减法 |
| `multiply(value)` | `Currency` | 乘法 |
| `divide(value)` | `Currency` | 除法 |
| `distribute(count)` | `Currency[]` | 将金额尽量平均分配，余数从前往后分配 |

### CurrencyOptions

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `symbol` | `string` | `$` | 格式化时显示的货币符号 |
| `separator` | `string` | `,` | 千位分隔符 |
| `decimal` | `string` | `.` | 小数分隔符 |
| `precision` | `number` | `2` | 小数位数，同时决定 `intValue` 的换算精度 |
| `fromCents` | `boolean` | `false` | 是否将输入值按最小货币单位解析 |
| `increment` | `number` | — | 按指定增量进行展示舍入 |
| `pattern` | `string` | `!#` | 正数格式，`!` 代表符号、`#` 代表金额 |
| `negativePattern` | `string` | `-!#` | 负数格式 |
| `errorOnInvalid` | `boolean` | `false` | 无效输入时是否抛出异常 |

业务代码中如需展示金额，建议使用 `format()`；如需提交给后端的分值，可使用 `intValue`。
