import { defaultPlaybackRate, defaultPlaybackRates, playbackRateLabel } from '../constant'
import { cloneIcon } from '../core/icon'
import type { PlaybackRateConfig, PluginDefinition } from '../types/plugin'

const formatRate = (rate: number) => `${rate}x`

export const playbackRatePlugin: PluginDefinition<PlaybackRateConfig> = {
  key: 'playbackRate',
  label: playbackRateLabel,
  defaultConfig: {
    rates: defaultPlaybackRates,
    defaultRate: defaultPlaybackRate,
  },
  install({ art, setting }, config) {
    if (config.defaultRate !== defaultPlaybackRate) {
      art.playbackRate = config.defaultRate
    }

    setting({
      html: art.i18n.get('Play Speed'),
      icon: cloneIcon(art.icons.playbackRate),
      tooltip: formatRate(config.defaultRate),
      selector: config.rates.map((rate) => ({
        html: formatRate(rate),
        value: rate,
        default: rate === config.defaultRate,
      })),
      // 返回值会写回菜单项右侧的副标题
      onSelect: (selector) => {
        const rate = Number(selector.value)

        if (Number.isNaN(rate)) return ''

        art.playbackRate = rate

        return formatRate(rate)
      },
    })
  },
}
