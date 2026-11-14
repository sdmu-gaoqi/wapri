import { defaultWebFullscreen, webFullscreenLabel } from '../constant'
import { cloneIcon } from '../core/icon'
import type { PluginDefinition, WebFullscreenConfig } from '../types/plugin'

export const webFullscreenPlugin: PluginDefinition<WebFullscreenConfig> = {
  key: 'webFullscreen',
  label: webFullscreenLabel,
  defaultConfig: {
    defaultOn: defaultWebFullscreen,
  },
  install({ art, setting }, config) {
    const item = setting({
      html: art.i18n.get('Web Fullscreen'),
      icon: cloneIcon(art.icons.fullscreenWebOff),
      switch: config.defaultOn,
      onSwitch: () => {
        art.fullscreenWeb = !art.fullscreenWeb

        return art.fullscreenWeb
      },
    })

    // 用户按 ESC 或从原生控件退出时，回写开关状态
    art.on('fullscreenWeb', (state) => {
      item.switch = state
    })

    if (config.defaultOn && !art.fullscreenWeb) {
      art.fullscreenWeb = true
    }
  },
}
