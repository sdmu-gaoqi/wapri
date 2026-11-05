import type { SidebarMode } from '../Sidebar/types'

/** MainContent 组件 props */
export interface MainContentProps {
  /** 侧栏导航模式，`grouped` 时主内容区按分组导航宽度让位 */
  mode?: SidebarMode
  /** 侧栏是否折叠 */
  collapse?: boolean
  /** 侧栏是否隐藏，隐藏时主内容区占满整行 */
  sidebarHide?: boolean
  /** 是否移动端布局，移动端侧栏为抽屉，主内容区不偏移 */
  mobile?: boolean
  /** 是否禁用间距过渡动画 */
  withoutAnimation?: boolean
  /** 是否显示标签页，输出 `has-tags-view` 类名供外部样式区分 */
  hasTagsView?: boolean
}
