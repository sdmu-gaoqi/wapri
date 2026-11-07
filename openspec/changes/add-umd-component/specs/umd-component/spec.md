## ADDED Requirements

### Requirement: 远程 UMD 组件的加载与解析

`@wapri/element-pro` SHALL 提供 `UmdComponent`，按 `url` 顺序串行加载远程 UMD 脚本，并按 `name` 从 `globalThis` 上解析组件。

#### Scenario: 串行加载并按路径取组件

- **WHEN** 传入 `url: ['https://cdn.example.com/react.production.min.js', 'https://cdn.example.com/react-dom.production.min.js', 'https://cdn.example.com/widget.umd.js']` 与 `name: 'MyWidget'`
- **THEN** 三个脚本按数组顺序串行插入 `<script>`
- **AND** 全部加载完成后从 `globalThis.MyWidget` 取到组件
- **AND** `name` 支持点号路径，如 `Lib.Button`

#### Scenario: 同一地址只加载一次

- **WHEN** 页面上两个 `UmdComponent` 传入同一个脚本地址
- **THEN** DOM 中只存在一个带 `data-loaded="ready"` 的对应 `<script>`
- **AND** 第二个实例复用第一次的加载结果

#### Scenario: 资源统一走 loadResource

- **WHEN** `css` 传入 `https://cdn.example.com/widget.css`
- **THEN** 按样式表注入 `<link>`，脚本按 `<script>` 注入
- **AND** 两者都由 `@wapri/gutils` 的 `loadResource` 完成，组件内不重复实现注入与去重

#### Scenario: 加载失败

- **WHEN** `loadResource` 返回 `error` 或 reject
- **THEN** 组件进入 `error` 状态并触发 `error` 事件
- **AND** 错误信息包含失败的资源地址

#### Scenario: 全局变量不存在

- **WHEN** 脚本加载成功但 `name` 指向的全局变量不存在
- **THEN** 组件进入 `error` 状态并触发 `error` 事件
- **AND** 错误信息包含缺失的全局变量名

#### Scenario: 加载超时

- **WHEN** 脚本在 `timeout` 毫秒内没有加载完成
- **THEN** 组件进入 `error` 状态并触发 `error` 事件
- **AND** 错误信息包含超时时间与被阻塞的地址

### Requirement: React UMD 渲染

`UmdComponent` SHALL 用 `ReactDOM.createRoot` 渲染 React UMD 组件，运行时缺少该 API 时回退 `ReactDOM.render`。

#### Scenario: React 18 渲染与属性更新

- **WHEN** `framework="react"` 且页面已存在全局 `React` 与 `ReactDOM`
- **THEN** 远程组件挂载到组件内部的容器节点
- **AND** `componentProps` 变化时复用同一个根实例重新渲染，不重新挂载
- **AND** `UmdComponent` 卸载时调用根实例的 `unmount`

#### Scenario: 缺少 React 运行时

- **WHEN** `framework="react"` 但全局缺少 `React` 或 `ReactDOM`
- **THEN** 组件进入 `error` 状态并触发 `error` 事件
- **AND** 错误信息提示需要先加载对应的 UMD 脚本

### Requirement: Vue UMD 渲染

`UmdComponent` SHALL 用 Vue 的 `h()` 渲染 Vue UMD 组件，与宿主应用共用同一个 Vue 运行时。

#### Scenario: 渲染 Vue 组件

- **WHEN** `framework="vue"` 且 `name` 解析到 Vue 组件（含 `setup` 或 `render`）
- **THEN** 远程组件作为根容器的子节点渲染
- **AND** `componentProps` 以 props 形式传入，`onXxx` 作为事件监听
- **AND** `componentProps` 内部字段变化时远程组件同步更新

#### Scenario: Vue 插件不能当组件渲染

- **WHEN** `name` 解析到的对象只有 `install`、没有 `setup` / `render` / `template`
- **THEN** 组件进入 `error` 状态
- **AND** 错误信息提示需要通过点号指向具体组件

### Requirement: 框架自动识别

`framework="auto"` SHALL 先按组件特征识别框架，识别不出来时再参考页面已加载的全局运行时。

#### Scenario: 按组件特征识别

- **WHEN** 解析到的对象带 `$$typeof` 或 `prototype.isReactComponent`
- **THEN** 按 React 渲染
- **AND** 解析到的对象带 `setup` / `render` / `template` 时按 Vue 渲染

#### Scenario: 函数组件兜底

- **WHEN** 解析到的是普通函数，且页面已存在全局 `React`
- **THEN** 按 React 渲染
- **AND** 页面没有全局 `React` 时按 Vue 渲染

### Requirement: 加载状态与插槽

`UmdComponent` SHALL 在加载中、成功、失败三种状态间切换，并允许宿主替换占位内容。

#### Scenario: 加载中与失败占位

- **WHEN** 组件处于加载中状态
- **THEN** 渲染 `loading` 插槽内容，未提供时展示默认文案
- **AND** 失败时渲染 `error` 插槽，插槽参数为 `{ error, url }`

#### Scenario: 重新加载

- **WHEN** 调用实例方法 `reload()`
- **THEN** 组件重新进入加载中状态并重新解析组件
- **AND** 上一次的 React 根实例先被 `unmount`

### Requirement: 文档与发布

`UmdComponent` SHALL 提供 dumi 文档页与可运行示例，并通过 changeset 以次版本号发布。

#### Scenario: 文档页可访问

- **WHEN** 执行 `pnpm dev` 并访问 `/element-pros/umd-component`
- **THEN** 渲染 `packages/element-pro/src/UmdComponent/index.md`
- **AND** 页面包含 Vue UMD 与 React UMD 两个可运行示例

#### Scenario: 版本记录

- **WHEN** 查看本变更新增的 `.changeset/*.md`
- **THEN** 其中包含 `"@wapri/element-pro": minor`
- **AND** 摘要说明新增 `UmdComponent`
