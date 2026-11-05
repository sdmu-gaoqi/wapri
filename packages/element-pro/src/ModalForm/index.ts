import Component from './index.vue'
import { withInstall } from '../utils/install'

export const ModalForm = withInstall(Component)
export type { ModalFormProps } from '../shared/overlayForm/types'
export default ModalForm
