import type { SettingOption } from 'artplayer'
import type { PluginContext } from '../types/plugin'

/** 菜单里「开关 + 滑杆」两行配置 */
export interface EffectMenuOptions {
  /** 开关行文案 */
  label: string
  /** 滑杆行文案 */
  rangeLabel: string
  /** 两行共用的图标 */
  icon: string
  /** 开关初始状态 */
  enabled: boolean
  /** 滑杆初始值 */
  value: number
  min: number
  max: number
  step: number
  /** 切换开关 */
  onToggle: (enabled: boolean) => void
  /** 拖动滑杆 */
  onRange: (value: number) => void
}

export interface EffectMenu {
  switchItem: SettingOption
  rangeItem: SettingOption
}

/**
 * 生成效果类插件通用的两行菜单。
 * 开关行的 `onSwitch` 会回写自身状态，滑杆行的返回值写进右侧副标题。
 */
export const createEffectMenu = (context: Pick<PluginContext, 'setting'>, options: EffectMenuOptions): EffectMenu => {
  const switchItem = context.setting({
    html: options.label,
    icon: options.icon,
    switch: options.enabled,
    onSwitch: (item) => {
      const next = !item.switch

      options.onToggle(next)

      return next
    },
  })

  const rangeItem = context.setting({
    html: options.rangeLabel,
    icon: options.icon,
    range: [options.value, options.min, options.max, options.step],
    onChange: (item) => {
      const next = Number(item.$range?.value ?? options.value)

      options.onRange(next)

      return String(next)
    },
  })

  return { switchItem, rangeItem }
}
