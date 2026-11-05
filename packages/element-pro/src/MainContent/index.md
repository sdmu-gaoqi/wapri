---
title: MainContent 主内容区
group:
  title: 布局
  order: 3
---

# MainContent 主内容区

配合 [Sidebar](/element-pros/sidebar) 使用的主内容区容器。它负责在侧栏展开 / 折叠 / 分组导航 / 移动端抽屉等状态下给主内容区让位，宽度与侧栏取自同一套 CSS 变量，宿主覆盖变量就能同时改变两侧。

## 基础用法

下面把 `Sidebar` 和 `MainContent` 拼成一个完整外壳，点击按钮切换折叠状态可以看到主内容区自动让位。

<code src="./demo/basic.vue" title="基础用法"></code>

## Props

| 属性               | 说明                                                         | 类型                        | 默认值      |
| ------------------ | ------------------------------------------------------------ | --------------------------- | ----------- |
| `mode`             | 侧栏导航模式，`grouped` 时主内容区按分组导航宽度让位          | `'classic' \| 'grouped'`    | `'classic'` |
| `collapse`         | 侧栏是否折叠                                                 | `boolean`                   | `false`     |
| `sidebarHide`      | 侧栏是否隐藏，隐藏时主内容区占满整行                          | `boolean`                   | `false`     |
| `mobile`           | 是否移动端布局，移动端侧栏为抽屉，主内容区不偏移              | `boolean`                   | `false`     |
| `withoutAnimation` | 是否禁用间距过渡动画                                         | `boolean`                   | `false`     |
| `hasTagsView`      | 是否显示标签页，仅用于输出 `has-tags-view` 类名供外部样式区分 | `boolean`                   | `false`     |

## 插槽

| 插槽名    | 说明             |
| --------- | ---------------- |
| `default` | 主内容区内容     |

## 类名

根节点固定输出 `wa-ui-main-content`，并按 props 追加以下状态类，方便外部样式做区分：

| 类名                  | 说明                     |
| --------------------- | ------------------------ |
| `is-grouped`          | 侧栏为分组导航           |
| `is-collapsed`        | 侧栏已折叠               |
| `is-mobile`           | 移动端布局               |
| `is-sidebar-hidden`   | 侧栏已隐藏               |
| `without-animation`   | 禁用过渡动画             |
| `has-tags-view`       | 显示了标签页             |

## 宽度

让位宽度取自侧栏的 CSS 变量，覆盖后侧栏与主内容区会一起变化：

| 变量名                                   | 默认值  | 使用场景             |
| ---------------------------------------- | ------- | -------------------- |
| `--wa-ui-sidebar-width`              | `200px` | 经典模式展开态       |
| `--wa-ui-sidebar-collapsed-width`    | `54px`  | 折叠态               |
| `--wa-ui-sidebar-grouped-width`      | `260px` | 分组导航展开态       |

## 说明

- `MainContent` 只负责主内容区的让位与滚动容器语义，侧栏自身的定位（`position: fixed` 等）由宿主决定。
- 内部如果放了 `.fixed-header` 这类固定顶栏，容器会自动撑满视口高度（`height: 100vh; overflow: hidden`），由内部区域各自滚动。
- 窄屏下的让位策略由宿主决定：如果需要在 ≤1280px 时收窄，可在自己的媒体查询里把 `margin-left` 改成 `var(--wa-ui-sidebar-grouped-width-sm)`，同时把侧栏宽度也改成同一个变量。
