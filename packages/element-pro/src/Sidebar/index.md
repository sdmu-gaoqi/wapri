---
title: Sidebar 侧栏导航
group:
  title: 布局
  order: 0
---

# Sidebar 侧栏导航

侧栏导航组件，支持 **双列分组导航**（`mode="grouped"`）与 **经典 el-menu 树形导航**（`mode="classic"`）两种模式。

组件是**纯受控组件**：菜单数据、激活项、折叠态、主题、Logo 全部通过 props 传入，内部不依赖任何 Pinia store 或 vue-router 实例。菜单跳转默认交给全局注册的 `router-link`，也可以传 `linkComponent` 换成任意自定义链接组件。

依赖要求：`vue >= 3.3`、`element-plus >= 2.4`（需在使用方项目中引入 Element Plus 及其样式）。

## 基础用法

经典 `classic` 模式，支持多级子菜单、外部链接与 `activeMenu` 高亮。

<code src="./demo/basic.vue" title="基础用法"></code>

## 双列分组导航

`mode="grouped"` 时，一级菜单渲染为分组标题，二级菜单以两列网格展示；折叠后分组收成图标，悬浮弹出二级菜单。分组导航固定使用浅色主题。

<code src="./demo/grouped.vue" title="双列分组导航"></code>

## 自定义图标与 Logo

通过 `renderIcon` 接管图标渲染，通过 `logo` 插槽完全替换品牌区。

<code src="./demo/collapse.vue" title="自定义图标与 Logo"></code>

## 接入方式

组件不关心数据来源，宿主只需把「已按权限过滤后的菜单树」和「当前激活路径」传进来即可：

```vue | pure
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Sidebar, type SidebarMenuItem } from '@wapri/element-pro'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const menus = computed<SidebarMenuItem[]>(() => permissionStore.sidebarRouters)
const activeMenu = computed(() => (typeof route.meta.activeMenu === 'string' ? route.meta.activeMenu : route.path))
const collapse = computed(() => !appStore.sidebar.opened)
</script>

<template>
  <Sidebar
    mode="grouped"
    :menus="menus"
    :active-menu="activeMenu"
    :collapse="collapse"
    logo="/logo.png"
    title="wa"
    subtitle="后台"
    portal="merchant"
  />
</template>
```

## Props

| 属性            | 说明                                                                  | 类型                                | 默认值           |
| --------------- | --------------------------------------------------------------------- | ----------------------------------- | ---------------- |
| `menus`         | 侧栏菜单数据，通常为已按权限过滤后的一级菜单列表                      | `SidebarMenuItem[]`                 | `[]`             |
| `activeMenu`    | 当前激活菜单路径                                                      | `string`                            | `''`             |
| `collapse`      | 是否折叠侧栏                                                          | `boolean`                           | `false`          |
| `mode`          | 导航模式，`grouped` 双列分组 / `classic` 经典 el-menu                 | `'classic' \| 'grouped'`            | `'classic'`      |
| `theme`         | 侧栏主题；`grouped` 模式固定使用浅色主题                              | `'light' \| 'dark'`                 | `'dark'`         |
| `variables`     | 主题变量，落到实例根节点的行内 CSS 变量上；不传时使用 `:root` 上的全局 CSS 变量 | `SidebarVariables`                  | -                |
| `showLogo`      | 是否显示 Logo 区域                                                    | `boolean`                           | `true`           |
| `logo`          | Logo 图片地址                                                         | `string`                            | `''`             |
| `title`         | Logo 主标题；未配置 `logo` 时折叠态会直接展示该标题                   | `string`                            | `''`             |
| `subtitle`      | Logo 副标题（门户名称），不传则不渲染门户标识                         | `string`                            | `''`             |
| `portal`        | 门户标识类型，决定副标题配色                                          | `'merchant' \| 'platform'`          | `'merchant'`     |
| `logoTo`        | Logo 点击跳转目标                                                     | `SidebarLinkTarget`                 | `'/index'`       |
| `linkComponent` | 内部链接使用的组件，传入自定义组件即可完全接管链接渲染                | `string \| Component`               | `'router-link'`  |
| `renderIcon`    | 自定义图标渲染函数；命中 Element Plus 图标名时不会调用                | `(icon: string) => VNodeChild`      | -                |

## 插槽

| 插槽名 | 说明                                              | 作用域参数              |
| ------ | ------------------------------------------------- | ----------------------- |
| `logo` | 替换整个 Logo 区域，不传则使用内置的 `SidebarLogo` | `{ collapse, grouped }` |

## 配套组件

侧栏的品牌区与经典菜单项也单独导出，方便在顶部导航等自定义布局里复用：

| 组件          | 说明                                                                 | Props                     |
| ------------- | -------------------------------------------------------------------- | ------------------------- |
| `SidebarLogo` | 侧栏品牌区，支持 `logo` / `title` / `subtitle` / `portal` 等展示配置  | `SidebarLogoProps`        |
| `SidebarItem` | 经典 `el-menu` 树形导航的递归菜单项，可直接放进任意 `el-menu` 中使用  | `SidebarItemProps`        |

```vue | pure
<script setup lang="ts">
import { SidebarItem, SidebarLogo } from '@wapri/element-pro'
</script>

<template>
  <SidebarLogo
    title="wa"
    subtitle="后台"
    portal="merchant"
  />
  <ElMenu mode="horizontal">
    <SidebarItem
      v-for="menu in menus"
      :key="menu.path"
      :item="menu"
      :base-path="menu.path"
    />
  </ElMenu>
</template>
```

## 主题配置

侧栏主题与 Element Plus 一致，全部是 CSS 变量：element-pro 的样式产物里已经在 `:root` 上声明了一套 `--wa-ui-sidebar-*` 变量，宿主只要在自己的样式里覆盖同名变量即可定制，不需要引入 scss，也不需要额外的 JS 配置。

```css
:root {
  /* 侧栏宽度 */
  --wa-ui-sidebar-width: 200px;
  --wa-ui-sidebar-collapsed-width: 54px;
  --wa-ui-sidebar-grouped-width: 260px;
  /* 深色主题配色 */
  --wa-ui-sidebar-menu-background: #1a1f2e;
  --wa-ui-sidebar-menu-color: #bfcbd9;
  /* 激活态默认跟随 Element Plus 主题色 */
  --wa-ui-sidebar-active-color: var(--el-color-primary);
}
```

如果只想改某一个实例，也可以直接传 `variables` 属性，它会落到该实例根节点的行内样式上：

```vue | pure
<Sidebar
  :menus="menus"
  :variables="{ menuBackground: '#1f2937' }"
/>
```

可用的变量见下方 `SidebarVariables`。

## 数据结构

### SidebarMenuItem

| 字段                | 说明                                                             | 类型                      |
| ------------------- | ---------------------------------------------------------------- | ------------------------- |
| `path`              | 菜单路径，支持绝对路径与相对父级的相对路径                       | `string`                  |
| `hidden`            | 是否在侧栏中隐藏                                                 | `boolean`                 |
| `alwaysShow`        | 是否始终渲染为父级菜单，即使只有一个可见子菜单                   | `boolean`                 |
| `noShowingChildren` | 是否没有可显示的子菜单                                           | `boolean`                 |
| `query`             | JSON 字符串形式的查询参数，如 `{"id":"1"}`                       | `string`                  |
| `children`          | 子菜单                                                           | `SidebarMenuItem[]`       |
| `meta`              | 菜单元信息                                                       | `SidebarMenuMeta`         |

### SidebarMenuMeta

| 字段         | 说明                                                                     | 类型     |
| ------------ | ------------------------------------------------------------------------ | -------- |
| `title`      | 菜单标题                                                                 | `string` |
| `icon`       | 菜单图标，支持 Element Plus 图标名（`Setting` / `setting` / `el-icon-setting`）或自定义图标名 | `string` |
| `activeMenu` | 需要高亮的菜单路径，用于详情页等隐藏路由                                 | `string` |

### SidebarVariables

| 字段                  | 说明                     | 默认值                                |
| --------------------- | ------------------------ | ------------------------------------- |
| `menuColor`           | 深色主题菜单文字颜色     | `#bfcbd9`                             |
| `menuLightColor`      | 浅色主题菜单文字颜色     | `rgba(0, 0, 0, 0.7)`                  |
| `menuColorActive`     | 深色主题激活态文字颜色   | `#ffffff`                             |
| `menuBackground`      | 深色主题菜单背景色       | `#1a1f2e`                             |
| `menuLightBackground` | 浅色主题菜单背景色       | `#ffffff`                             |
| `subMenuBackground`   | 深色主题子菜单背景色     | `#141824`                             |
| `subMenuHover`        | 深色主题子菜单悬浮背景色 | `rgba(255, 255, 255, 0.06)`           |
| `logoTitleColor`      | Logo 主标题颜色          | `#ffffff`                             |
| `logoLightTitleColor` | Logo 浅色主题主标题颜色  | `#001529`                             |
| `activeColor`         | 激活态主色               | `var(--el-color-primary)`             |
| `activeColorLight`    | 浅色主题激活态背景色     | `var(--el-color-primary-light-9)`     |
| `activeColorDarkBg`   | 深色主题激活态背景色     | `rgba(64, 158, 255, 0.2)`             |
| `width`               | 侧栏宽度                 | `200px`                               |
| `groupedWidth`        | 分组导航展开态宽度       | `260px`                               |
| `collapsedWidth`      | 折叠态宽度               | `54px`                                |

## 对外暴露的 CSS 变量

element-pro 的样式产物会在 `:root` 上声明以下变量，宿主直接覆盖即可：

| 变量名                                       | 默认值                        | 说明                     |
| -------------------------------------------- | ----------------------------- | ------------------------ |
| `--wa-ui-sidebar-width`                  | `200px`                       | 侧栏展开宽度             |
| `--wa-ui-sidebar-collapsed-width`        | `54px`                        | 侧栏折叠宽度             |
| `--wa-ui-sidebar-grouped-width`          | `260px`                       | 双列分组导航宽度         |
| `--wa-ui-sidebar-grouped-width-sm`       | `240px`                       | 窄屏下的分组导航宽度     |
| `--wa-ui-sidebar-logo-height`            | `56px`                        | Logo 区域高度            |
| `--wa-ui-sidebar-menu-background`        | `#1a1f2e`                     | 深色主题菜单背景色       |
| `--wa-ui-sidebar-menu-color`             | `#bfcbd9`                     | 深色主题菜单文字色       |
| `--wa-ui-sidebar-menu-color-active`      | `#ffffff`                     | 深色主题激活态文字色     |
| `--wa-ui-sidebar-menu-light-background`  | `#ffffff`                     | 浅色主题菜单背景色       |
| `--wa-ui-sidebar-menu-light-color`       | `rgba(0, 0, 0, 0.7)`          | 浅色主题菜单文字色       |
| `--wa-ui-sidebar-sub-menu-background`    | `#141824`                     | 深色主题子菜单背景色     |
| `--wa-ui-sidebar-sub-menu-hover`         | `rgba(255, 255, 255, 0.06)`   | 深色主题子菜单悬浮背景色 |
| `--wa-ui-sidebar-logo-title-color`       | `#ffffff`                     | Logo 主标题颜色          |
| `--wa-ui-sidebar-logo-light-title-color` | `#001529`                     | Logo 浅色主题主标题颜色  |
| `--wa-ui-sidebar-active-color`           | `var(--el-color-primary)`     | 激活态主色               |
| `--wa-ui-sidebar-active-color-light`     | `var(--el-color-primary-light-9)` | 浅色主题激活态背景色 |
| `--wa-ui-sidebar-active-color-dark-bg`   | `color-mix(... 20%, transparent)` | 深色主题激活态背景色 |
| `--wa-height-side-menu`                  | `28px`                        | 分组二级菜单行高         |
| `--wa-font-size-side-menu`               | `13px`                        | 分组二级菜单字号         |
| `--wa-font-size-side-header`             | `14px`                        | 分组标题字号             |

另外，主色板也以 CSS 变量形式提供：`--wa-ui-color-blue`、`--wa-ui-color-light-blue`、`--wa-ui-color-red`、`--wa-ui-color-pink`、`--wa-ui-color-green`、`--wa-ui-color-tiffany`、`--wa-ui-color-yellow`。

## 说明

- 组件内所有样式都收敛在 `.wa-ui-sidebar` 下，浮层使用 `wa-ui-sidebar-*` 前缀，不会污染宿主应用的全局样式。
- 侧栏自身的定位、宽度过渡、主内容区偏移等属于应用外壳布局，由宿主决定，组件不做假设。
- `menus` 会按 `path` 与 `meta.title` 去重，避免后端下发重复菜单导致侧栏出现重复项。
- `grouped` 模式只支持一级、二级菜单；遇到三级节点时会把第三级叶子提升到二级展示。
