---
title: canIUse
group:
  title: 方法
  order: 1
---

# canIUse

判断当前三端容器是否支持指定的 Native 方法, 暂未约定。

<!-- <code src="./demo/index.vue"></code> -->

```ts | pure
import { jsbridge } from "@wapri/gjsbridge";

jsbridge
  .canIUse({ api: "需要检测的 Native 方法名" })
  .then(({ result }) => {
    // result 为 '1' 表示支持，'0' 表示不支持
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
```

## 参数

| 参数 | 类型      | 说明                       |
| ---- | --------- | -------------------------- |
| api  | `ApiKeys` | 需要检测的 Native 方法名。 |

`ApiKeys` 在 `packages/jsbridge/src/types/apis.ts` 中维护，当前已登记 `'debug.demp'`；新增可检测的 Native 方法时同步扩充该联合类型。

## 返回值

| 参数   | 类型         | 说明                               |
| ------ | ------------ | ---------------------------------- |
| result | `'0' \| '1'` | `'1'` 表示支持，`'0'` 表示不支持。 |

## 说明

`apiRegistry` 中 `canIUse` 映射到 Native 方法 `permission.caniuse`。调用时会先合并 `initialParams` 再合并业务参数（业务参数优先）；库内不注入任何业务身份参数，需要时由业务侧显式传入。

```ts | pure
export const apiRegistry = {
  canIUse: {
    nativeMethod: 'permission.caniuse',
  },
}
```
