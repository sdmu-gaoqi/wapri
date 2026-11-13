import FileListComponent from './index.vue'
import { withInstall } from '../utils/install'

export const FileList = withInstall(FileListComponent)

export * from './types'
export * from './utils'

export default FileList
