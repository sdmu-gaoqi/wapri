import { defaultMosaicSize, mosaicLabel, mosaicMax, mosaicMin, mosaicSizeText, mosaicStep } from '../constant'
import { mosaicIcon } from '../constant/icons'
import { createEffectMenu } from '../core/effectMenu'
import type { EffectMenu } from '../core/effectMenu'
import type { MosaicConfig, PluginDefinition } from '../types/plugin'

export const mosaicPlugin: PluginDefinition<MosaicConfig> = {
  key: 'mosaic',
  label: mosaicLabel,
  defaultConfig: {
    enabled: false,
    size: defaultMosaicSize,
    min: mosaicMin,
    max: mosaicMax,
    step: mosaicStep,
  },
  install({ frame, setting, onCleanup }, config) {
    let enabled = config.enabled
    let size = config.size
    let menu: EffectMenu | undefined

    const apply = () => {
      frame.set('mosaic', enabled ? { size } : null)
    }

    menu = createEffectMenu(
      { setting },
      {
        label: mosaicLabel,
        icon: mosaicIcon,
        rangeLabel: mosaicSizeText,
        enabled,
        value: size,
        min: config.min,
        max: config.max,
        step: config.step,
        onToggle: (next) => {
          enabled = next
          apply()
        },
        onRange: (next) => {
          size = next
          // 拖滑杆即视为要用效果，顺手把开关打开
          if (!enabled) {
            enabled = true
            if (menu) menu.switchItem.switch = true
          }
          apply()
        },
      },
    )

    apply()

    onCleanup(() => frame.set('mosaic', null))
  },
}
