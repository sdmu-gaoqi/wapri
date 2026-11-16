# 最佳实践与硬约定

写 `@wapri/*` 代码时必须遵守的约定。与文档冲突时，以源码为准（用 `get_file_code` 核对）。

## 引入

```ts
// 组件、类型、工具函数都从包入口引入
import { ProTable, DragSortTable, ModalForm, ProFormText, type ProColumn } from '@wapri/element-pro'

// element-plus 的组件与语言包由 element-pro 入口统一透出，业务不必再装 element-plus 才能用
import { ElConfigProvider } from '@wapri/element-pro'

// 基础能力
import { storage, MyStorage } from '@wapri/gbase'
import { debounce, dayjs } from '@wapri/gutils'
import { useRequest } from '@wapri/ghooks'
```

- 样式：`@wapri/element-pro` 入口已经 `import 'element-plus/dist/index.css'`，**业务不要重复引**，否则主题变量会被二次覆盖。
- 不要从 `@wapri/*/dist/...` 或 `src/...` 这类内部路径引入。
- 包内已有能力优先复用：日期处理用 `gutils` 导出的 `dayjs`，防抖/节流用 `gutils` 导出的 lodash 方法，不要另引依赖。

## 命名（避免与 Element Plus 撞名）

| 用这个 | 不要用 | 说明 |
| --- | --- | --- |
| `ProConfigProvider` | `ConfigProvider` | 全局注册名仍是 `ConfigProvider`，JS 里导入时用 `Pro` 前缀 |
| `ProSortState` | `SortState` | 表格排序状态类型 |

- 自定义 class 一律以 `wa-ui-` 为前缀（`defaultPrefix`），不要自己造前缀。

## 表格

- 字段格式化统一走 `src/shared/field/`（`ValueType` / `ValueEnum` / `formatCellValue`），表格与表单共用同一份解析，不要在列里手写格式化。
- 需要「顺序即语义」时用 `DragSortTable`，不要自己接 SortableJS：`dragSortKey` 指定把手列，`onDragSortEnd(before, after, next)` 里存序。
- 拖拽不跨页；`dragSortKey` 那一列不能设 `fixed`；树形数据暂不支持。

## 表单

- 容器：`ModalForm` / `DrawerForm`；字段：`ProFormFields` 下的一组组件（`ProFormText`、`ProFormSelect` …）。字段通过 `name` 读写 `ElForm` 的 `model`。
- 联动与数组：`ProFormDependency`（按 `names` 订阅字段子集）、`ProFormList`（行内字段用**相对名**，路径前缀由容器注入，不要手拼 `users.${index}`）。
- 分步：`StepsForm` + `StepsForm.StepForm`，每步独立 `model`，最后合并交给 `onFinish`；`name` 在同一容器内唯一。
- 多 tab：`TabForm` + `TabForm.Item`，所有 tab 共用一份 `model`，提交时校验全部并跳到第一个出错分段。

## 播放器（`@wapri/gplayer`）

- `plugins` 是 `Array<string | { key; setting }>`；不传时只启用 `filter` 与 `webFullscreen`，其它插件要显式声明。
- 读插件的类型化配置用 `pluginEntry`，不要自己 cast。
- 逐帧改画面（马赛克 / 模糊 / 背景模糊 / 防抖 / 绿幕 / 竖屏）走 `PluginContext.frame`，共享同一层 canvas；写 `video.style.filter` 走 `PluginContext.cssFilter`，否则多个插件互相覆盖。

## 预览（`@wapri/preview`）

```ts
const handle = await previewFile(file, { container })
handle.refresh() // 容器尺寸变化后重排
handle.destroy() // 释放 canvas / worker / objectURL
```

- 只在需要时创建，离开页面必须 `destroy()`。

## 禁用项

- 禁止 `localStorage` / `sessionStorage`，统一用 `@wapri/gbase` 的 `storage` / `MyStorage`。
- 禁止 `any`；类型超过三个或实现较长时，类型放同级 `types/` 目录。
- 业务域名、桶名、网关前缀、Token 键、App 通道名走配置或环境变量，不写进源码。
- 不要为了「跑起来」放宽项目的 lint / tsconfig 规则。

## 版本对齐

工具返回的每个包都带版本。落代码前比对项目 `package.json`：

- 版本一致 → 直接照文档写。
- 项目版本更低 → 先用 `search_code` 确认该能力在旧版本里是否已存在，或提示用户升级。
- 项目版本更高 → 提醒用户知识可能滞后，建议升级 `@wapri/mcp`。
