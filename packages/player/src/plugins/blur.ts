import { blurLabel, blurMax, blurMin, blurRadiusText, blurStep, defaultBlurRadius } from '../constant'
import { blurIcon } from '../constant/icons'
import { createEffectMenu } from '../core/effectMenu'
import type { EffectMenu } from '../core/effectMenu'
import type { BlurConfig, PluginDefinition } from '../types/plugin'

export const blurPlugin: PluginDefinition<BlurConfig> = {
  key: 'blur',
  label: blurLabel,
  defaultConfig: {
    enabled: false,
    radius: defaultBlurRadius,
    min: blurMin,
    max: blurMax,
    step: blurStep,
  },
  install({ frame, setting, onCleanup }, config) {
    let enabled = config.enabled
    let radius = config.radius
    let menu: EffectMenu | undefined

    const apply = () => {
      // 半径为 0 时等于没有效果，直接关掉覆盖层，省一层合成
      frame.set('blur', enabled && radius > 0 ? { radius } : null)
    }

    menu = createEffectMenu(
      { setting },
      {
        label: blurLabel,
        icon: blurIcon,
        rangeLabel: blurRadiusText,
        enabled,
        value: radius,
        min: config.min,
        max: config.max,
        step: config.step,
        onToggle: (next) => {
          enabled = next
          apply()
        },
        onRange: (next) => {
          radius = next
          if (!enabled) {
            enabled = true
            if (menu) menu.switchItem.switch = true
          }
          apply()
        },
      },
    )

    apply()

    onCleanup(() => frame.set('blur', null))
  },
}
