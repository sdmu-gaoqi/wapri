import LayoutComponent from './index.vue'
import { withInstall } from '../utils/install'

export const Layout = withInstall(LayoutComponent)

export type { LayoutProps } from './types'

export default Layout
