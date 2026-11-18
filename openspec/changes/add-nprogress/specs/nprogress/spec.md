# Spec Delta

## Purpose

为 `@wapri/element-pro` 提供页面顶部的函数式进度条：业务用 `NProgress.start()` / `NProgress.done()` 两行代码接进路由守卫或请求拦截器，进度条自己走完、自己淡出、自己清理 DOM，样式跟随 Element Plus 主题色，不需要额外安装第三方 `nprogress`。

## ADDED Requirements

### Requirement: 函数式生命周期

`NProgress` SHALL 以模块单例的形式暴露 `start()`、`done(force?)`、`remove()`、`isStarted()`，调用方不需要在模板中声明任何组件。

#### Scenario: 开始与完成

- **WHEN** 调用 `NProgress.start()`
- **THEN** 页面顶部出现 2px 高的进度条，初始进度等于 `minimum`（默认 `0.08`）
- **AND** `NProgress.isStarted()` 返回 `true`，`NProgress.status` 为当前进度
- **WHEN** 随后调用 `NProgress.done()`
- **THEN** 进度条推进到 100%，随后淡出并从 DOM 中移除
- **AND** `NProgress.status` 回到 `null`，`isStarted()` 返回 `false`

#### Scenario: 未开始时调用 done

- **WHEN** 从未调用过 `start()` 时调用 `NProgress.done()`
- **THEN** 不创建任何 DOM，也不报错
- **AND** 传 `done(true)` 时强制执行收尾，移除可能残留的进度条

#### Scenario: 重复 start 不重置进度

- **WHEN** 进度已经走到 0.5 时再次调用 `NProgress.start()`
- **THEN** 进度保持 0.5，不回退到 `minimum`
- **AND** 进度条保持可见

#### Scenario: 淡出期间重新开始

- **WHEN** `done()` 之后、节点尚未移除时调用 `start()`
- **THEN** 取消待执行的收尾定时器，进度条重新显示
- **AND** 进度从 `minimum` 重新开始

#### Scenario: 主动清理

- **WHEN** 调用 `NProgress.remove()`
- **THEN** 立即移除 DOM 与所有定时器，`status` 置为 `null`
- **AND** 清除 `<html>` 上的忙碌标记

### Requirement: 手动控制进度

`NProgress` SHALL 提供 `set(value)` 与 `inc(amount?)`，让调用方可以按真实进度推进。

#### Scenario: 设置绝对值

- **WHEN** 调用 `NProgress.set(0.5)`
- **THEN** 进度条停在一半的位置，`status` 为 `0.5`
- **AND** 传入小于 `minimum` 的值时按 `minimum` 渲染
- **AND** 传入大于等于 `maximum` 的值等价于 `done()`

#### Scenario: 递增

- **WHEN** 进度为 0.5 时调用 `NProgress.inc()`
- **THEN** 进度按当前区间对应的步长增加，且不超过 `0.994`
- **WHEN** 传入 `NProgress.inc(0.2)`
- **THEN** 按 0.2 增加，同样不超过 `0.994`

#### Scenario: 未开始时 inc

- **WHEN** 未调用 `start()` 时直接调用 `NProgress.inc()`
- **THEN** 等价于 `start()`，进度条从 `minimum` 开始

### Requirement: 自动递增

`NProgress` SHALL 在 `trickle` 为 `true`（默认）时按 `trickleSpeed`（默认 200ms）自动递增，`done()` 或 `remove()` 后停止。

#### Scenario: 自动推进

- **WHEN** 调用 `start()` 后等待若干个 `trickleSpeed`
- **THEN** 进度自动增长，且越接近完成步长越小
- **AND** 最高不超过 `0.994`，不会自行走完

#### Scenario: 关闭自动递增

- **WHEN** `NProgress.configure({ trickle: false })` 后调用 `start()`
- **THEN** 进度停留在 `minimum`，只有显式调用 `inc()` / `set()` 才变化
- **AND** 不产生定时器

### Requirement: 配置与主题

`NProgress` SHALL 通过 `configure(options)` 更新配置，已挂载的进度条立即生效；颜色、高度、层级、过渡时长 MUST 走 CSS 变量，默认颜色跟随 `--el-color-primary`。

#### Scenario: 修改配置

- **WHEN** 调用 `NProgress.configure({ showSpinner: false, color: 'var(--el-color-success)' })`
- **THEN** 右上角转圈隐藏
- **AND** 进度条颜色改为传入值
- **AND** `NProgress.settings` 反映最新配置

#### Scenario: 主题联动

- **WHEN** 宿主把 `--el-color-primary` 覆盖为品牌色，未显式传 `color`
- **THEN** 进度条颜色跟随品牌色，不需要额外配置

#### Scenario: 局部进度条

- **WHEN** `configure({ parent: '#panel' })` 或传入元素后再 `start()`
- **THEN** 进度条挂载到该容器并随之定位，而不是固定在视口顶部
- **AND** 不修改容器自身的 `position`

### Requirement: 环境与实例隔离

`NProgress` MUST 在无 `document` 的环境下安全降级，并支持通过 `createNProgress()` 创建互不干扰的实例。

#### Scenario: SSR 环境

- **WHEN** 在 `typeof document === 'undefined'` 的环境调用 `start()` / `done()`
- **THEN** 不抛异常，`status` 保持 `null`

#### Scenario: 多实例

- **WHEN** 用 `createNProgress({ parent: '#a' })` 与 `createNProgress({ parent: '#b' })` 各建一个实例并分别 `start()`
- **THEN** 两个容器各出现一条进度条，进度互不影响
- **AND** 其中一个 `remove()` 不影响另一个
