---
title: NProgress 顶部进度条
group:
  title: 基础
  order: 4
---

# NProgress 顶部进度条

页面顶部的一条细进度条，函数式调用，不需要在模板里放组件：

```ts
import { NProgress } from '@wapri/element-pro'

NProgress.start()
await fetchData()
NProgress.done()
```

适合路由切换、首屏拉数据、批量导入/导出这类「页面级异步」。进度条自己会往前走，`done()` 之后走满、淡出并移除节点，不需要手动清理 DOM。

## 基础用法

<code src="./demo/basic.vue" title="手动控制"></code>

`start()` 幂等：进度已经走到一半时再调一次不会退回起点。`set(value)` 按 0 - 1 的绝对值推进，`set(1)` 等价于 `done()`。

## 配置

<code src="./demo/configure.vue" title="样式与行为"></code>

颜色、高度、层级、过渡时长都走 CSS 变量，默认色取 `--el-color-primary`，宿主换主题色时进度条会跟着变，不需要额外配置。

```css
:root {
  --wa-ui-nprogress-height: 3px;
  --wa-ui-nprogress-color: var(--el-color-success);
}
```

## 接入路由与请求

`start()` / `done()` 是同步调用，直接放进守卫或拦截器即可，重复调用不会把进度重置回起点：

```ts
// 路由
router.beforeEach(() => {
  NProgress.start()
})
router.afterEach(() => {
  NProgress.done()
})

// 请求
axios.interceptors.request.use((config) => {
  NProgress.start()
  return config
})
axios.interceptors.response.use(
  (response) => {
    NProgress.done()
    return response
  },
  (error) => {
    NProgress.done()
    return Promise.reject(error)
  },
)
```

需要按真实进度推进时用 `set()`：比如上传进度回调里 `NProgress.set(percent / 100)`。

## 局部进度条

默认挂在 `body`、固定在视口顶部。传 `parent` 可以挂到指定容器里（容器需自己设置 `position`），再用 `createNProgress` 建独立实例，就能和全局进度条并存：

```ts
import { createNProgress } from '@wapri/element-pro'

const panelProgress = createNProgress({ parent: '#panel', showSpinner: false })

panelProgress.start()
panelProgress.set(0.3)
panelProgress.done()
```

## API

`NProgress` 是模块级单例，`createNProgress(options?)` 返回同样接口的独立实例。

| 方法              | 说明                                                       | 返回值     |
| ----------------- | ---------------------------------------------------------- | ---------- |
| `start()`         | 开始；已经在走时保持当前进度                               | 实例       |
| `done(force?)`    | 推进到 100% 后淡出并移除节点；`force` 为 `true` 时强制收尾 | 实例       |
| `inc(amount?)`    | 递增；未开始时等价于 `start()`                             | 实例       |
| `set(value)`      | 设置 0 - 1 的绝对值，到达上限等价于 `done()`               | 实例       |
| `trickle()`       | 递增一档，与 `inc()` 等价                                  | 实例       |
| `configure(opts)` | 合并配置，已挂载的进度条立即生效                           | 实例       |
| `isStarted()`     | 是否正在走                                                 | `boolean`  |
| `remove()`        | 立即移除节点与全部定时器                                   | 实例       |
| `status`          | 当前进度，未开始时为 `null`                                | `number \| null` |
| `settings`        | 补全默认值后的配置副本                                     | `NProgressSettings` |

## Options

`configure()` 与 `createNProgress()` 的入参一致，全部可省略。

| 属性           | 说明                                   | 类型                     | 默认值     |
| -------------- | -------------------------------------- | ------------------------ | ---------- |
| `minimum`      | 起始进度，也是 `set()` 的下限          | `number`                 | `0.08`     |
| `maximum`      | 进度上限，到达即视为完成               | `number`                 | `1`        |
| `trickle`      | 是否自动递增                           | `boolean`                | `true`     |
| `trickleSpeed` | 自动递增间隔（ms）                     | `number`                 | `200`      |
| `showSpinner`  | 是否显示右上角转圈                     | `boolean`                | `true`     |
| `speed`        | 进度动画与淡出时长（ms）               | `number`                 | `200`      |
| `easing`       | 进度过渡曲线                           | `string`                 | `'ease'`   |
| `parent`       | 挂载容器，选择器或元素；不传则挂 body  | `string \| HTMLElement`  | `null`     |
| `zIndex`       | 层级                                   | `number`                 | `2000`     |
| `color`        | 进度条颜色                             | `string`                 | 跟随主题色 |

## CSS 变量

| 变量                        | 说明           | 默认值                          |
| --------------------------- | -------------- | ------------------------------- |
| `--wa-ui-nprogress-color`   | 进度条颜色     | `var(--el-color-primary, #409eff)` |
| `--wa-ui-nprogress-height`  | 进度条高度     | `2px`                           |
| `--wa-ui-nprogress-z-index` | 层级           | `2000`                          |
| `--wa-ui-nprogress-speed`   | 过渡时长       | `200ms`                         |
| `--wa-ui-nprogress-easing`  | 过渡曲线       | `ease`                          |

## 说明

- 不依赖第三方 `nprogress`，API 与其对齐（`start` / `done` / `inc` / `set` / `trickle` / `configure` / `isStarted` / `remove` / `status` / `settings`）。
- 自动递增最高到 `0.994`，剩下的留给 `done()`；`trickle: false` 时不会建定时器。
- `status` / `settings` 是普通 getter，不是响应式数据；要在界面上显示进度，自己同步到 `ref`（见基础用法 demo）。
- 没有 `document` 的环境（SSR / Node）下所有方法都是空操作。
- 页面提前离开、不想让进度条继续走时调用 `remove()`，会一并清掉定时器与节点。
- 进度条不在组件树内，因此不受 `ProConfigProvider` 的 `prefix` 影响，统一使用 `wa-ui` 前缀。
