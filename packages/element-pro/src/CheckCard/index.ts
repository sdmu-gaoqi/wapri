import CheckCardComponent from './index.vue'
import CheckCardGroupComponent from './Group.vue'
import { withInstall } from '../utils/install'

export const CheckCardGroup = withInstall(CheckCardGroupComponent)
export const CheckCard = withInstall(CheckCardComponent, { Group: CheckCardGroup })
export * from './types'
export default CheckCard
