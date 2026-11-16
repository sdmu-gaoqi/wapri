import ConfigProviderComponent from './index.vue'
import { withInstall } from '../utils/install'

export const ProConfigProvider = withInstall(ConfigProviderComponent)
export type { ConfigProviderProps as ProConfigProviderProps } from './index.vue'
export type { ElementProSize } from './context'
export default ProConfigProvider
