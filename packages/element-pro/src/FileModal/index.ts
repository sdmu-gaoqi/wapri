import FileModalComponent from './index.vue'
import { withInstall } from '../utils/install'

export const FileModal = withInstall(FileModalComponent)

export * from './types'
export * from './utils'

export default FileModal
