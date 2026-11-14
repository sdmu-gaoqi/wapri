import FileUploadComponent from './index.vue'
import { withInstall } from '../utils/install'

export const FileUpload = withInstall(FileUploadComponent)

export * from './types'
export * from './utils'

export default FileUpload
