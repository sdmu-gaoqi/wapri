import type { Component, VNodeChild } from 'vue'

/** 侧栏菜单元信息 */
export interface SidebarMenuMeta {
  /** 菜单标题 */
  title?: string
  /** 菜单图标，支持 Element Plus 图标名（`Setting`、`setting`、`el-icon-setting`）或由 `renderIcon` 处理的自定义图标名 */
  icon?: string
  /** 需要高亮的菜单路径，用于详情页等隐藏路由 */
  activeMenu?: string
}

/** 侧栏菜单项，兼容若依风格的动态路由结构 */
export interface SidebarMenuItem {
  /** 菜单路径，支持绝对路径与相对父级的相对路径 */
  path: string
  /** 是否在侧栏中隐藏 */
  hidden?: boolean
  /**
   * 是否始终渲染为父级菜单，即使只有一个可见子菜单
   * @default true
   * */
  alwaysShow?: boolean
  /** 是否没有可显示的子菜单 */
  noShowingChildren?: boolean
  /** JSON 字符串形式的查询参数，如 `{"id":"1"}` */
  query?: string
  /** 子菜单 */
  children?: SidebarMenuItem[]
  /** 菜单元信息 */
  meta?: SidebarMenuMeta
}

/** 菜单跳转目标 */
export type SidebarLinkTarget = string | { path: string; query?: Record<string, unknown> }

/** 侧栏导航模式：`grouped` 双列分组导航，`classic` 经典 el-menu 树形导航 */
export type SidebarMode = 'classic' | 'grouped'

/** 侧栏主题：`dark` 深色主题，`light` 浅色主题 */
export type SidebarTheme = 'light' | 'dark'

/** Logo 门户标识：`merchant` 后台，`platform` 平台 */
export type SidebarPortal = 'merchant' | 'platform'

/**
 * 侧栏主题变量，会被映射为组件根节点的 CSS 变量。
 * 不传时使用内置默认值，也可在外部通过同名 CSS 变量覆盖。
 */
export interface SidebarVariables {
  /** 深色主题菜单文字颜色 */
  menuColor?: string
  /** 浅色主题菜单文字颜色 */
  menuLightColor?: string
  /** 深色主题激活态文字颜色 */
  menuColorActive?: string
  /** 深色主题菜单背景色 */
  menuBackground?: string
  /** 浅色主题菜单背景色 */
  menuLightBackground?: string
  /** 深色主题子菜单背景色 */
  subMenuBackground?: string
  /** 深色主题子菜单悬浮背景色 */
  subMenuHover?: string
  /** Logo 主标题颜色 */
  logoTitleColor?: string
  /** Logo 浅色主题主标题颜色 */
  logoLightTitleColor?: string
  /** 激活态主色 */
  activeColor?: string
  /** 浅色主题激活态背景色 */
  activeColorLight?: string
  /** 深色主题激活态背景色 */
  activeColorDarkBg?: string
  /** 侧栏宽度 */
  width?: string
  /** 分组导航展开态宽度 */
  groupedWidth?: string
  /** 折叠态宽度 */
  collapsedWidth?: string
}

/** 自定义图标渲染函数，入参为菜单元信息中的 `icon` */
export type SidebarIconRender = (icon: string) => VNodeChild

/** Sidebar 组件 props */
export interface SidebarProps {
  /** 侧栏菜单数据，通常为已按权限过滤后的一级菜单列表 */
  menus?: SidebarMenuItem[]
  /** 当前激活菜单路径，通常由宿主传入 `route.path`，并优先使用 `route.meta.activeMenu` */
  activeMenu?: string
  /** 是否折叠侧栏 */
  collapse?: boolean
  /** 导航模式，默认 `classic` */
  mode?: SidebarMode
  /** 侧栏主题，默认 `dark`；`grouped` 模式下固定使用浅色主题 */
  theme?: SidebarTheme
  /** 主题变量 */
  variables?: SidebarVariables
  /** 是否显示 Logo 区域 */
  showLogo?: boolean
  /** Logo 图片地址 */
  logo?: string
  /** Logo 主标题，未配置 `logo` 时折叠态会直接展示该标题 */
  title?: string
  /** Logo 副标题，即门户名称，不传则不渲染门户标识 */
  subtitle?: string
  /** 门户标识类型，决定副标题的配色 */
  portal?: SidebarPortal
  /** Logo 点击跳转目标，默认 `/index` */
  logoTo?: SidebarLinkTarget
  /** 内部链接使用的组件，默认 `router-link`；传入自定义组件即可完全接管链接渲染 */
  linkComponent?: string | Component
  /** 自定义图标渲染函数，命中 Element Plus 图标名时不会调用 */
  renderIcon?: SidebarIconRender
}

/** 菜单链接渲染所需信息 */
export interface SidebarLinkInfo {
  /** 跳转目标 */
  to: SidebarLinkTarget
  /** 是否为外部链接 */
  isExternal: boolean
  /** 是否为当前激活项 */
  active: boolean
  /** 对应的菜单项 */
  item?: SidebarMenuItem
}

/** SidebarLogo 组件 props */
export interface SidebarLogoProps {
  /** 是否折叠 */
  collapse?: boolean
  /** 是否处于分组导航模式 */
  grouped?: boolean
  /** Logo 图片地址 */
  logo?: string
  /** 主标题 */
  title?: string
  /** 副标题（门户名称） */
  subtitle?: string
  /** 门户标识类型 */
  portal?: SidebarPortal
  /** 点击跳转目标 */
  to?: SidebarLinkTarget
  /** 内部链接使用的组件 */
  linkComponent?: string | Component
}

/** SidebarItem 组件 props */
export interface SidebarItemProps {
  /** 菜单项 */
  item: SidebarMenuItem
  /** 是否为嵌套子菜单 */
  isNest?: boolean
  /** 父级路径 */
  basePath?: string
  /** 自定义图标渲染函数 */
  renderIcon?: SidebarIconRender
  /** 内部链接使用的组件 */
  linkComponent?: string | Component
}
