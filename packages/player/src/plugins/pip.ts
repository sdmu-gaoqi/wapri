import { pipLabel } from '../constant'
import { cloneIcon } from '../core/icon'
import type { PipConfig, PluginDefinition } from '../types/plugin'

const isPipSupported = () => 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled

export const pipPlugin: PluginDefinition<PipConfig> = {
  key: 'pip',
  label: pipLabel,
  defaultConfig: {
    autoEnter: false,
  },
  install({ art, setting, onCleanup }, config) {
    const item = setting({
      html: art.i18n.get('PIP Mode'),
      icon: cloneIcon(art.icons.pip),
      switch: art.pip,
      onSwitch: () => {
        const next = !art.pip

        if (!isPipSupported()) {
          art.notice.show = art.i18n.get('PIP Not Supported')
          return art.pip
        }

        art.pip = next

        return next
      },
    })

    // 用户从浏览器原生控件退出画中画时，回写开关状态
    art.on('pip', (state) => {
      item.switch = state
    })

    if (config.autoEnter) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && art.playing && isPipSupported()) {
          art.pip = true
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      onCleanup(() => document.removeEventListener('visibilitychange', handleVisibilityChange))
    }
  },
}
