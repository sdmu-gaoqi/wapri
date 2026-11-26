/** WaTabbar 对外类型 */

export interface TabbarItem {
  /** 与 van-tabbar 的 modelValue 对应的业务 key */
  key: string
  title: string
  /** van-icon 名称 */
  icon?: string
  /** 选中态图标，不传时沿用 icon */
  activeIcon?: string
  badge?: string | number
  dot?: boolean
}

export interface WaTabbarProps {
  modelValue: string
  items: TabbarItem[]
  fixed?: boolean
  safeAreaInsetBottom?: boolean
  placeholder?: boolean
  border?: boolean
  activeColor?: string
  inactiveColor?: string
  zIndex?: number | string
}

export interface WaTabbarEmits {
  'update:modelValue': [key: string]
  'change': [item: TabbarItem]
}
