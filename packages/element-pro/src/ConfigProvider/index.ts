import ConfigProviderComponent from './index.vue'
import { withInstall } from '../utils/install'

export const ConfigProvider = withInstall(ConfigProviderComponent)
export type { ConfigProviderProps } from './index.vue'
export type { ElementProSize } from './context'
export default ConfigProvider
