import type { SidebarProps } from '../Sidebar/types'

/** Layout 头部配置 */
export interface LayoutHeaderConfig {
  /** 头部是否固定：固定后头部不随内容滚动，宽度跟随侧栏状态自动让位 */
  fixed?: boolean
}

/** Layout 组件 props */
export interface LayoutProps {
  /** 透传给内部 Sidebar 的属性 */
  sidebar?: SidebarProps
  /** 头部配置 */
  header?: LayoutHeaderConfig
  /** 是否隐藏侧栏，隐藏时主内容区占满整行 */
  sidebarHidden?: boolean
  /** 是否渲染内置的侧栏折叠按钮，可通过 trigger 插槽替换；侧栏隐藏时不渲染 */
  trigger?: boolean
  /** 是否移动端布局，移动端侧栏为抽屉，折叠时整块滑出 */
  mobile?: boolean
  /** 是否禁用过渡动画 */
  withoutAnimation?: boolean
  /** 是否显示标签页，透传给 MainContent */
  hasTagsView?: boolean
}
