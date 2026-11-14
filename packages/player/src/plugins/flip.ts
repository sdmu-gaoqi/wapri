import { defaultFlipMode, defaultFlipModes, flipLabel } from '../constant'
import { cloneIcon } from '../core/icon'
import type { FlipConfig, FlipMode, PluginDefinition } from '../types/plugin'

/** artplayer 的多语言表里三个方向都有对应 key */
const i18nKeyMap: Record<FlipMode, string> = {
  normal: 'Normal',
  horizontal: 'Horizontal',
  vertical: 'Vertical',
}

export const flipPlugin: PluginDefinition<FlipConfig> = {
  key: 'flip',
  label: flipLabel,
  defaultConfig: {
    modes: defaultFlipModes,
    defaultMode: defaultFlipMode,
  },
  install({ art, setting }, config) {
    const formatMode = (mode: FlipMode) => art.i18n.get(i18nKeyMap[mode])

    if (config.defaultMode !== defaultFlipMode) {
      art.flip = config.defaultMode
    }

    setting({
      html: art.i18n.get('Video Flip'),
      icon: cloneIcon(art.icons.flip),
      tooltip: formatMode(config.defaultMode),
      selector: config.modes.map((mode) => ({
        html: formatMode(mode),
        value: mode,
        default: mode === config.defaultMode,
      })),
      onSelect: (selector) => {
        const mode = String(selector.value) as FlipMode

        art.flip = mode

        return formatMode(mode)
      },
    })
  },
}
