import MainContentComponent from './index.vue'
import { withInstall } from '../utils/install'

export const MainContent = withInstall(MainContentComponent)

export type { MainContentProps } from './types'

export default MainContent
