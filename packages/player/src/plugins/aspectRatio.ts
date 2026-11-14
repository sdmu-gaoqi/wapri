import { aspectRatioLabel, defaultAspectRatio, defaultAspectRatios } from '../constant'
import { cloneIcon } from '../core/icon'
import type { AspectRatioConfig, AspectRatioValue, PluginDefinition } from '../types/plugin'

export const aspectRatioPlugin: PluginDefinition<AspectRatioConfig> = {
  key: 'aspectRatio',
  label: aspectRatioLabel,
  defaultConfig: {
    ratios: defaultAspectRatios,
    defaultRatio: defaultAspectRatio,
  },
  install({ art, setting }, config) {
    const formatRatio = (ratio: AspectRatioValue) => (ratio === defaultAspectRatio ? art.i18n.get('Default') : ratio)

    if (config.defaultRatio !== defaultAspectRatio) {
      art.aspectRatio = config.defaultRatio
    }

    setting({
      html: art.i18n.get('Aspect Ratio'),
      icon: cloneIcon(art.icons.aspectRatio),
      tooltip: formatRatio(config.defaultRatio),
      selector: config.ratios.map((ratio) => ({
        html: formatRatio(ratio),
        value: ratio,
        default: ratio === config.defaultRatio,
      })),
      onSelect: (selector) => {
        const ratio = String(selector.value) as AspectRatioValue

        art.aspectRatio = ratio

        return formatRatio(ratio)
      },
    })
  },
}
