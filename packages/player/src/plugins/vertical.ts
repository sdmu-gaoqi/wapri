import {
  defaultVerticalMode,
  verticalLabel,
  verticalModeContainText,
  verticalModeCropText,
  verticalModeRotateText,
  verticalModeText,
  verticalRatio,
} from '../constant'
import { verticalIcon } from '../constant/icons'
import type { PluginDefinition, VerticalConfig, VerticalMode } from '../types/plugin'

const modeLabels: Record<VerticalMode, string> = {
  crop: verticalModeCropText,
  contain: verticalModeContainText,
  rotate: verticalModeRotateText,
}

export const verticalPlugin: PluginDefinition<VerticalConfig> = {
  key: 'vertical',
  label: verticalLabel,
  defaultConfig: {
    enabled: false,
    mode: defaultVerticalMode,
    ratio: verticalRatio,
  },
  install({ art, setting, frame, onCleanup }, config) {
    let enabled = config.enabled
    let mode = config.mode
    let previousRatio = art.aspectRatio

    const apply = () => {
      if (!enabled) {
        art.aspectRatio = previousRatio
        frame.set('vertical', null)

        return
      }

      art.aspectRatio = config.ratio
      frame.set(
        'vertical',
        mode === 'rotate' ? { fit: 'cover', rotate: 90 } : { fit: mode === 'contain' ? 'contain' : 'cover', rotate: 0 },
      )
    }

    setting({
      html: verticalLabel,
      icon: verticalIcon,
      switch: enabled,
      onSwitch: (item) => {
        const next = !item.switch

        // 进入竖屏前记下当前比例，退出时原样还回去
        if (next && !enabled) previousRatio = art.aspectRatio

        enabled = next
        apply()

        return next
      },
    })

    setting({
      html: verticalModeText,
      icon: verticalIcon,
      tooltip: modeLabels[mode],
      selector: (Object.keys(modeLabels) as VerticalMode[]).map((item) => ({
        html: modeLabels[item],
        value: item,
        default: item === mode,
      })),
      onSelect: (selector) => {
        mode = String(selector.value) as VerticalMode
        apply()

        return modeLabels[mode]
      },
    })

    apply()

    onCleanup(() => {
      frame.set('vertical', null)
      art.aspectRatio = previousRatio
    })
  },
}
