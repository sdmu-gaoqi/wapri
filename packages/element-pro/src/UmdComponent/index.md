---
title: UmdComponent 远程 UMD 组件
group:
  title: 基础
  order: 3
---

# UmdComponent 远程 UMD 组件

按需从 CDN 加载 UMD 脚本，解析脚本暴露的全局变量，再把其中的组件渲染到当前页面。React UMD 与 Vue UMD 都支持。

- React：优先用 `ReactDOM.createRoot`（React 18），没有时回退 `ReactDOM.render`（React 17 及以下），重复渲染复用同一个根实例。
- Vue：直接用 `h()` 渲染远程组件，复用宿主应用的 Vue 运行时与组件上下文。

<code src="./demo/basic.vue" title="基础用法"></code>

## 何时使用

- 业务组件独立发版、以 UMD 形式部署在 CDN，宿主应用想按需加载。
- 宿主是 Vue 3，但要嵌入一个 React 写的 UMD 组件（或反过来）。

只渲染组件，不负责注册插件：Vue 的 UMD 插件（只有 `install`）请用 `name` 点号指向其中的具体组件，例如 `ElementPlus.ElButton`。

## 加载流程

资源加载复用 `@wapri/gutils` 的 `loadResource`：`.css` 结尾按样式表处理、其余按脚本处理，同一地址已加载成功时直接复用。

1. 串行加载 `css`（样式表）。
2. 串行加载 `url`（脚本数组），保证 `react` 先于 `react-dom`、运行时先于业务组件。
3. 按 `name` 从 `globalThis` 上取组件，路径支持点号；取到的对象带 `default` 时自动回退默认导出。
4. 按 `framework` 渲染：`auto` 先看组件特征（React 的 `$$typeof` / `prototype.isReactComponent`、Vue 的 `setup` / `render`），判断不出来时再看页面已有的全局运行时。

同一地址只注入一个 `<script>` / `<link>`（`loadResource` 用 `data-loaded` 标记去重），重复实例、重复挂载都复用同一份结果。
## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `url` | UMD 脚本地址，按数组顺序串行加载 | `string \| string[]` | — |
| `name` | 组件在全局对象上的路径，支持点号 | `string` | — |
| `framework` | 渲染框架；`auto` 时自动判断 | `'vue' \| 'react' \| 'auto'` | `'auto'` |
| `componentProps` | 透传给远程组件的 props，事件也放这里 | `Record<string, unknown>` | `{}` |
| `css` | 需要一并注入的样式表地址，地址需以 `.css` 结尾 | `string \| string[]` | `[]` |
| `timeout` | 资源加载超时（毫秒），`0` 表示不限制 | `number` | `15000` |
| `tag` | 根节点标签名 | `string` | `'div'` |

## 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `load` | 资源加载完成且解析到组件后触发 | `{ framework: 'vue' \| 'react'; component: unknown }` |
| `error` | 加载或挂载失败时触发 | `{ error: Error; url: string[] }` |

## 插槽

| 插槽名 | 说明 | 插槽参数 |
| --- | --- | --- |
| `loading` | 加载中的占位内容 | — |
| `error` | 失败时的占位内容 | `{ error: Error; url: string[] }` |

## 实例方法

通过 `ref` 拿到组件实例后可以调用：

| 方法 / 属性 | 说明 |
| --- | --- |
| `reload()` | 重新加载资源并重新解析组件 |
| `component` | 当前解析到的远程组件 |
| `framework` | 当前生效的框架 |

## Vue UMD

```vue | pure
<UmdComponent
  :url="['https://cdn.example.com/widget.umd.js']"
  name="MyWidget"
  framework="vue"
  :component-props="{ title: '标题', onChange: handleChange }"
>
  <template #loading>加载中…</template>
  <template #error="{ error }">{{ error.message }}</template>
</UmdComponent>
```

Vue 3 的 UMD 组件通常把 `vue` 声明成 external，运行时会去读全局 `Vue`。宿主需要提前挂好 `window.Vue`，或者把 Vue 的 UMD 脚本放进 `url` 数组里。组件本身不篡改任何全局变量。

## React UMD

```vue | pure
<UmdComponent
  :url="[
    'https://cdn.example.com/react.production.min.js',
    'https://cdn.example.com/react-dom.production.min.js',
    'https://cdn.example.com/widget.umd.js',
  ]"
  name="MyWidget"
  framework="react"
  :component-props="{ title: '标题' }"
/>
```

React 组件从全局 `React` / `ReactDOM` 取运行时，所以两个运行时脚本必须排在业务组件之前。已经接入 React 的宿主可以直接复用页面上的全局实例，不必重复加载。

## 注意

- 远程脚本以宿主页面权限执行，只接入可信来源的地址。
- 组件卸载时会 `unmount` React 根实例；`<script>` / `<link>` 与 `window` 上的全局变量保留，供其他实例复用。
- `componentProps` 支持深层响应式：外层对象或内部字段变化都会同步到远程组件。
