import {
  backgroundBlurLabel,
  backgroundBlurMax,
  backgroundBlurMin,
  backgroundBlurOverscan,
  backgroundBlurRadiusText,
  backgroundBlurStep,
  defaultBackgroundBlurRadius,
} from '../constant'
import { backgroundBlurIcon } from '../constant/icons'
import { createEffectMenu } from '../core/effectMenu'
import type { EffectMenu } from '../core/effectMenu'
import type { BackgroundBlurConfig, PluginDefinition } from '../types/plugin'

export const backgroundBlurPlugin: PluginDefinition<BackgroundBlurConfig> = {
  key: 'backgroundBlur',
  label: backgroundBlurLabel,
  defaultConfig: {
    enabled: false,
    radius: defaultBackgroundBlurRadius,
    min: backgroundBlurMin,
    max: backgroundBlurMax,
    step: backgroundBlurStep,
  },
  install({ frame, setting, onCleanup }, config) {
    let enabled = config.enabled
    let radius = config.radius
    let menu: EffectMenu | undefined

    const apply = () => {
      frame.set('backgroundBlur', enabled && radius > 0 ? { radius, overscan: backgroundBlurOverscan } : null)
    }

    menu = createEffectMenu(
      { setting },
      {
        label: backgroundBlurLabel,
        icon: backgroundBlurIcon,
        rangeLabel: backgroundBlurRadiusText,
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

    onCleanup(() => frame.set('backgroundBlur', null))
  },
}
