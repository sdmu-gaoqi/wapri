# add-umd-component

## Why

业务组件越来越多以「独立发版 + UMD 产物挂 CDN」的形式交付，宿主应用需要按需加载并嵌入这些组件。`element-pro` 目前只有 `SvgIcon` 会按需加载远程脚本（图标集），没有任何能力把远程 UMD 包里的组件渲染出来；宿主只能自己写 `document.createElement('script')`、自己解析全局变量、自己处理 React 与 Vue 两套挂载逻辑，每接一个组件重复一遍。

本变更交付 `UmdComponent`：一次加载远程 UMD，按 `name` 解析组件，按框架渲染，React 与 Vue 共用同一套 props / 插槽 / 错误处理。

## What Changes

- 新增 `packages/element-pro/src/UmdComponent`：`loader.ts`（复用 `@wapri/gutils` 的 `loadResource`，串行加载 + 超时）、`resolve.ts`（全局路径解析、框架识别）、`react.ts`（React 18 `createRoot` / React 17 `render` 两种挂载）、`UmdComponent.ts`（组件本体）。
- `UmdComponent` 公开 props：`url`、`name`、`framework`、`componentProps`、`css`、`timeout`、`tag`；事件：`load`、`error`；插槽：`loading`、`error`；实例方法：`reload()`、`component`、`framework`。
- 框架识别：`framework="auto"` 时先看组件特征（React `$$typeof` / `prototype.isReactComponent`、Vue `setup` / `render`），判断不出来再看页面已有的全局运行时。
- `packages/element-pro/src/index.ts` 注册并导出 `UmdComponent` 与全部类型。
- 新增 dumi 文档页 `src/UmdComponent/index.md` 与可运行 demo（手写 UMD 产物 + Blob 地址，不依赖业务 CDN）。
- 新增 changeset（`minor`）。

## Impact

- Affected specs: `umd-component`（新增能力）
- Affected code:
  - 新增 `packages/element-pro/src/UmdComponent/{types.ts,loader.ts,resolve.ts,react.ts,UmdComponent.ts,index.ts,index.md,styles/index.scss,demo/basic.vue}`
  - 修改 `packages/element-pro/src/index.ts`（import、`export *`、具名导出、`components` 注册数组）
  - 新增 `.changeset/umd-component.md`
- 兼容性：纯新增组件，不改动既有组件的 props / 事件 / 样式；不新增依赖（React 运行时由宿主页面的全局变量提供，包内只做结构类型声明）。
