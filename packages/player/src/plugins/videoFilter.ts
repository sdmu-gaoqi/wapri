import {
  defaultVideoFilterIntensity,
  defaultVideoFilterPreset,
  videoFilterIntensityMax,
  videoFilterIntensityMin,
  videoFilterIntensityStep,
  videoFilterIntensityText,
  videoFilterLabel,
  videoFilterPresetLabels,
  videoFilterPresetOrder,
  renderVideoFilter,
} from '../constant'
import { videoFilterIcon } from '../constant/icons'
import type { PluginDefinition, VideoFilterConfig } from '../types/plugin'
import type { VideoFilterPreset } from '../types/frame'

export const videoFilterPlugin: PluginDefinition<VideoFilterConfig> = {
  key: 'videoFilter',
  label: videoFilterLabel,
  defaultConfig: {
    preset: defaultVideoFilterPreset,
    intensity: defaultVideoFilterIntensity,
    presets: videoFilterPresetOrder,
    min: videoFilterIntensityMin,
    max: videoFilterIntensityMax,
    step: videoFilterIntensityStep,
  },
  install({ setting, onCleanup, cssFilter }, config) {
    let preset = config.preset
    let intensity = config.intensity

    const formatIntensity = (value: number) => `${Math.round(value * 100)}%`

    const apply = () => {
      // 预设与强度都退化为空时移除片段，避免残留在 filter 里
      const fragment = preset === 'none' || intensity <= 0 ? '' : renderVideoFilter(preset, intensity)

      cssFilter.set('preset', fragment)
    }

    setting({
      html: videoFilterLabel,
      icon: videoFilterIcon,
      tooltip: videoFilterPresetLabels[preset],
      selector: config.presets.map((item) => ({
        html: videoFilterPresetLabels[item],
        value: item,
        default: item === preset,
      })),
      onSelect: (selector) => {
        preset = String(selector.value) as VideoFilterPreset
        apply()

        return videoFilterPresetLabels[preset]
      },
    })

    setting({
      html: videoFilterIntensityText,
      icon: videoFilterIcon,
      range: [intensity, config.min, config.max, config.step],
      onChange: (item) => {
        intensity = Number(item.$range?.value ?? intensity)
        apply()

        return formatIntensity(intensity)
      },
    })

    apply()

    onCleanup(() => cssFilter.remove('preset'))
  },
}
