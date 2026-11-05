import SidebarComponent from './index.vue'
import SidebarItemComponent from './components/SidebarItem.vue'
import SidebarLogoComponent from './components/SidebarLogo.vue'
import { withInstall } from '../utils/install'

export const Sidebar = withInstall(SidebarComponent)

/** 经典 el-menu 树形导航的递归菜单项，可在自定义 el-menu 布局中复用 */
export const SidebarItem = withInstall(SidebarItemComponent)

/** 侧栏品牌区，可在顶部导航等自定义布局中复用 */
export const SidebarLogo = withInstall(SidebarLogoComponent)

export type { SidebarItemProps, SidebarLogoProps } from './types'
export type {
  SidebarIconRender,
  SidebarLinkInfo,
  SidebarLinkTarget,
  SidebarMenuMeta,
  SidebarMenuItem,
  SidebarMode,
  SidebarPortal,
  SidebarProps,
  SidebarTheme,
  SidebarVariables,
} from './types'

export default Sidebar
