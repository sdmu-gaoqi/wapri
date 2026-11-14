import {
  defaultStabilizerStrength,
  stabilizerLabel,
  stabilizerMax,
  stabilizerMin,
  stabilizerStep,
  stabilizerStrengthText,
} from '../constant'
import { stabilizerIcon } from '../constant/icons'
import { createEffectMenu } from '../core/effectMenu'
import type { EffectMenu } from '../core/effectMenu'
import type { PluginDefinition, StabilizerConfig } from '../types/plugin'

export const stabilizerPlugin: PluginDefinition<StabilizerConfig> = {
  key: 'stabilizer',
  label: stabilizerLabel,
  defaultConfig: {
    enabled: false,
    strength: defaultStabilizerStrength,
    min: stabilizerMin,
    max: stabilizerMax,
    step: stabilizerStep,
  },
  install({ frame, setting, onCleanup }, config) {
    let enabled = config.enabled
    let strength = config.strength
    let menu: EffectMenu | undefined

    const apply = () => {
      // 强度为 0 时没有任何混合，直接关掉覆盖层
      frame.set('stabilizer', enabled && strength > 0 ? { strength } : null)
    }

    menu = createEffectMenu(
      { setting },
      {
        label: stabilizerLabel,
        icon: stabilizerIcon,
        rangeLabel: stabilizerStrengthText,
        enabled,
        value: strength,
        min: config.min,
        max: config.max,
        step: config.step,
        onToggle: (next) => {
          enabled = next
          apply()
        },
        onRange: (next) => {
          strength = next
          if (!enabled) {
            enabled = true
            if (menu) menu.switchItem.switch = true
          }
          apply()
        },
      },
    )

    apply()

    onCleanup(() => frame.set('stabilizer', null))
  },
}
