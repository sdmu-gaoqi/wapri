import Component from './index.vue'
import { withInstall } from '../utils/install'

export const DrawerForm = withInstall(Component)
export type { DrawerFormProps } from '../shared/overlayForm/types'
export default DrawerForm
