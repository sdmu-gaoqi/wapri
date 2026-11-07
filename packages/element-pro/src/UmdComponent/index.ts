import Component from './UmdComponent'
import { withInstall } from '../utils/install'

export const UmdComponent = withInstall(Component)
export * from './types'
export default UmdComponent
