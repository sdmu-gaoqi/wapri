# add-umd-component — 实施清单

> 目标：在 `@wapri/element-pro` 提供 `UmdComponent`，渲染远程 CDN 上的 Vue / React UMD 组件。

## 1. 组件实现

- [x] 1.1 `types.ts`：`UmdFramework`、`UmdFrameworkOption`、`UmdComponentStatus`、`UmdComponentProps`、`UmdComponentLoadPayload`、`UmdComponentErrorPayload`、`UmdComponentExpose`、`UmdMountHandle`
- [x] 1.2 `loader.ts`：`normalizeUrls` 归一化地址、`loadAsset` / `loadAssets` 串行调用 `@wapri/gutils` 的 `loadResource`（同地址由 `data-loaded` 去重）、`withTimeout` 超时
- [x] 1.3 `resolve.ts`：`getGlobal` 点号路径、`detectFramework` 自动识别、`resolveComponent` 回退 `default`、`isVuePlugin` 拦截插件
- [x] 1.4 `react.ts`：`assertReactRuntime` 运行时校验、`mountReactComponent` 的 `createRoot` / `render` 双分支与 `update` / `destroy`
- [x] 1.5 `UmdComponent.ts`：加载流程、状态机、`componentProps` 深层同步、`loading` / `error` 插槽、`reload` 暴露
- [x] 1.6 `styles/index.scss`：`wa-ui-umd-component` 及其 loading / error / react 修饰类

## 2. 导出与注册

- [x] 2.1 `src/UmdComponent/index.ts` 用 `withInstall` 包装并 `export * from './types'`
- [x] 2.2 `src/index.ts` 增加 import、`export * from './UmdComponent'`、具名导出与 `components` 注册数组

## 3. 文档与演示

- [x] 3.1 `src/UmdComponent/index.md`：能力说明、加载流程、Props / 事件 / 插槽 / 实例方法、Vue 与 React 两段接入示例
- [x] 3.2 `src/UmdComponent/demo/basic.vue`：手写 Vue / React UMD 产物经 Blob 地址加载，React 运行时取自公共 CDN，覆盖 props 变更与错误插槽

## 4. 发布与仓库同步

- [x] 4.1 新增 changeset：`"@wapri/element-pro": minor`
- [x] 4.2 确认无新增依赖、无新增 CI 工作流

## 5. 校验

- [x] 5.1 `npx oxlint packages/element-pro/src` 通过（0 warning / 0 error）
- [x] 5.2 `npx oxfmt --check` 覆盖新增文件通过
- [x] 5.3 `npx tsc -p packages/element-pro/tsconfig.json --noEmit` 无新增错误（仅 `ConfigProvider` / `SvgIcon` / `VH100` 的历史 TS2614）
- [x] 5.4 `pnpm --filter @wapri/element-pro build` 通过，`dist/UmdComponent/*.d.ts` 完整产出
