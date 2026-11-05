---
title: Layout 整体布局
group:
  title: 布局
  order: 4
---

# Layout 整体布局

把 [Sidebar](/element-pros/sidebar) 与 [MainContent](/element-pros/main-content) 组合起来的整体布局：侧栏固定在左侧，主内容区自动让位，顶部区域和主内容区通过 `header` / `main` 插槽传入。

侧栏配置整体通过 `sidebar` 属性透传，不需要把 `Sidebar` 的属性再抄一遍。

## 基础用法

<code src="./demo/basic.vue" title="基础用法"></code>

## Props

| 属性               | 说明                                                                 | 类型                 | 默认值      |
| ------------------ | -------------------------------------------------------------------- | -------------------- | ----------- |
| `sidebar`          | 透传给内部 `Sidebar` 的属性，见 `SidebarProps`                         | `SidebarProps`       | -           |
| `header`           | 头部配置，见下方「头部」                                               | `LayoutHeaderConfig` | -           |
| `sidebarHidden`    | 是否隐藏侧栏，隐藏时主内容区占满整行，折叠按钮也一并隐藏               | `boolean`            | `false`     |
| `trigger`          | 是否渲染内置的侧栏折叠按钮，可用 `trigger` 插槽替换                    | `boolean`            | `true`      |
| `mobile`           | 是否移动端布局，移动端侧栏为抽屉，折叠时整块滑出                       | `boolean`            | `false`     |
| `withoutAnimation` | 是否禁用过渡动画                                                      | `boolean`            | `false`     |
| `hasTagsView`      | 是否显示标签页，透传给 `MainContent`                                   | `boolean`            | `false`     |

其中 `sidebar.mode`、`sidebar.collapse` 会同时用于驱动主内容区的让位宽度，所以只需要在 `sidebar` 里配置一次。

### header

| 字段    | 说明                                                                     | 类型      | 默认值  |
| ------- | ------------------------------------------------------------------------ | --------- | ------- |
| `fixed` | 头部是否固定。固定后头部不随内容滚动，宽度跟随侧栏状态自动让位            | `boolean` | `false` |

`header.fixed` 为 `true` 时，`Layout` 会给头部容器加上 `is-fixed`，固定定位与宽度让位的样式已经内置在组件库里，宿主不需要再自己写一遍：

```vue | pure
<Layout
  :sidebar="sidebar"
  :header="{ fixed: true }"
>
  <template #header>
    <Navbar />
    <TagsView />
  </template>
  <template #main>
    <AppMain />
  </template>
</Layout>
```

头部容器默认渲染为 `wa-ui-layout__header`，固定时追加 `is-fixed`；内容直接放在 `header` 插槽里即可，不需要自己包一层容器。


## 事件

| 事件名           | 说明                                                 |
| ---------------- | ---------------------------------------------------- |
| `toggleSidebar` | 点击内置折叠按钮时触发，由宿主切换侧栏的展开 / 折叠   |

## 插槽

| 插槽名    | 说明                                                                 | 作用域参数              |
| --------- | -------------------------------------------------------------------- | ----------------------- |
| `trigger` | 替换内置的侧栏折叠按钮                                                | -                       |
| `header`  | 顶部区域内容，由 `Layout` 包在 `wa-ui-layout__header` 里           | -                       |
| `main`    | 主内容区                                                              | -                       |
| `logo`    | 透传给 `Sidebar` 的品牌区插槽，用于完全替换内置 Logo                   | `{ collapse, grouped }` |
| `default` | 渲染在布局根节点内的其他内容，例如移动端遮罩、全局浮层                 | -                       |

## 内置折叠按钮

`Layout` 默认会在主内容区左上角渲染一个折叠按钮（`wa-ui-layout__trigger`），点击时抛出 `toggleSidebar` 事件：

```vue | pure
<Layout
  :sidebar="sidebar"
  @toggle-sidebar="collapse = !collapse"
>
  <template #header>…</template>
  <template #main>…</template>
</Layout>
```

它是**绝对定位、浮在顶栏之上**的，不占文档流，所以宿主需要给自己的顶栏留出左侧间距，间距宽度用 `--wa-ui-layout-trigger-width` 计算：

```scss
.navbar {
  padding-left: calc(var(--wa-ui-layout-trigger-width) + 10px);
}
```

可覆盖的变量：

| 变量名                                          | 默认值                              | 说明           |
| ----------------------------------------------- | ----------------------------------- | -------------- |
| `--wa-ui-layout-trigger-width`              | `50px`                              | 按钮宽度       |
| `--wa-ui-layout-trigger-height`             | `56px`                              | 按钮高度       |
| `--wa-ui-layout-trigger-icon-size`          | `20px`                              | 图标尺寸       |
| `--wa-ui-layout-trigger-color`              | `#303133`                           | 图标颜色       |
| `--wa-ui-layout-trigger-hover-background`   | `var(--el-color-primary-light-9)`   | 悬浮背景色     |

不需要内置按钮时传 `:trigger="false"`，或者用 `trigger` 插槽换成自己的实现。

## 类名

根节点固定输出 `wa-ui-layout`，侧栏为 `wa-ui-layout__sidebar`，主内容区为 `wa-ui-layout__content`，头部为 `wa-ui-layout__header`（固定时追加 `is-fixed`），折叠按钮为 `wa-ui-layout__trigger`；根节点按状态追加 `is-grouped` / `is-collapsed` / `is-mobile` / `is-sidebar-hidden` / `without-animation`。


## 说明

- `Layout` 负责侧栏定位、头部固定与主内容区让位，宽度都取自侧栏的 CSS 变量。
- 侧栏自身的宽度（展开 / 折叠 / 分组）由 `Sidebar` 的 `is-grouped` / `is-collapsed` 决定，移动端因为要整块滑出，`Layout` 会把它固定成展开宽度。
- `header.fixed` 只负责头部的定位与宽度，头部内部长什么样（导航栏、标签页）由宿主决定。
