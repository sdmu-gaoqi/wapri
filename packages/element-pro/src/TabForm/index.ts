import TabFormComponent from './index.vue'
import TabFormItemComponent from './components/TabFormItem.vue'
import { withInstall } from '../utils/install'
import './styles/index.scss'

/** 单个分段，也可通过 `TabForm.Item` 使用。 */
export const TabFormItem = withInstall(TabFormItemComponent)

export const TabForm = withInstall(TabFormComponent, { Item: TabFormItem })

export * from './types'
