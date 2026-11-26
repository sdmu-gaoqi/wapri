import type { App, Component } from 'vue'
import WaEmpty from './components/empty/WaEmpty.vue'
import WaFilterBar from './components/filter-bar/WaFilterBar.vue'
import WaFilterDate from './components/filter-bar/WaFilterDate.vue'
import WaFilterRange from './components/filter-bar/WaFilterRange.vue'
import WaFilterSelect from './components/filter-bar/WaFilterSelect.vue'
import WaFilterTag from './components/filter-bar/WaFilterTag.vue'
import WaTabbar from './components/tabbar/WaTabbar.vue'
import WaUmdComponent from './components/umd-component/WaUmdComponent'
import WaUpload from './components/upload/WaUpload.vue'
import WaVH100 from './components/vh100/WaVH100.vue'
import './styles/index.css'

export {
  WaEmpty,
  WaFilterBar,
  WaFilterDate,
  WaFilterRange,
  WaFilterSelect,
  WaFilterTag,
  WaTabbar,
  WaUmdComponent,
  WaUpload,
  WaVH100,
}

export * from './types'
export * from './components/empty/types'
export * from './components/filter-bar/types'
export * from './components/tabbar/types'
export * from './components/umd-component/types'
export * from './components/upload/types'
export * from './components/vh100/types'

/** 组件实例 + 名字：name 由各 SFC 的 defineOptions 提供，注册时直接用，避免维护第二份名单 */
type WaComponent = Component & { name?: string }

export const components: WaComponent[] = [
  WaUpload,
  WaTabbar,
  WaFilterBar,
  WaFilterTag,
  WaFilterRange,
  WaFilterDate,
  WaFilterSelect,
  WaEmpty,
  WaVH100,
  WaUmdComponent,
]

export const install = (app: App): void => {
  components.forEach((component) => {
    if (component.name) app.component(component.name, component)
  })
}

export default { install }
