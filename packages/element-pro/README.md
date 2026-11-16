# @wapri/element-pro

基于 Vue 3 + TypeScript + Element Plus 的中后台组件库，提供 Layout、Sidebar、ProTable、抽屉/弹窗表单、SvgIcon、UmdComponent 等业务常用组件。

## Element Plus 透出

element-plus 的组件、hooks、指令、locale 与类型都从本包统一透出，业务只依赖 `@wapri/element-pro`：

```ts
import { ElButton, ElMessage, vLoading, zhCn } from '@wapri/element-pro'
import type { FormInstance, FormItemRule } from '@wapri/element-pro'
import { ElementPlus } from '@wapri/element-pro' // 完整实例，可 app.use(ElementPlus)
```

Element Plus 的主题样式已由包入口引入（`import 'element-plus/dist/index.css'`），宿主不需要再单独引一次。图标仍从 `@element-plus/icons-vue` 引入：它与 element-plus 都有 `Loading` 导出，不做二次透出。

## 命名变化

| 旧 | 新 | 说明 |
| --- | --- | --- |
| `ConfigProvider` | `ProConfigProvider` | 与 `ElConfigProvider` 区分；全局注册名仍是 `ConfigProvider` |
| `ConfigProviderProps` | `ProConfigProviderProps` | 同名类型 |
| `SortState` | `ProSortState` | ProTable 排序状态类型 |

## 在线文档

https://sdmu-gaoqi.github.io/wapri/element-pros
