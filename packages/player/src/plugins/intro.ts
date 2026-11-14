import {
  defaultIntroDelay,
  defaultIntroDuration,
  defaultIntroText,
  introClassName,
  introImageClassName,
  introLabel,
  introReplayText,
  introTextClassName,
} from '../constant'
import { introIcon } from '../constant/icons'
import { ensureOverlayStyle } from '../core/style'
import type { IntroConfig, PluginDefinition } from '../types/plugin'

export const introPlugin: PluginDefinition<IntroConfig> = {
  key: 'intro',
  label: introLabel,
  defaultConfig: {
    image: '',
    text: defaultIntroText,
    duration: defaultIntroDuration,
    delay: defaultIntroDelay,
    once: true,
  },
  install({ art, setting, onCleanup }, config) {
    ensureOverlayStyle()

    let layer: HTMLDivElement | undefined
    let timer = 0

    const remove = () => {
      if (timer) {
        window.clearTimeout(timer)
        timer = 0
      }

      layer?.remove()
      layer = undefined
    }

    const show = () => {
      remove()

      if (!config.image && !config.text) return

      const node = document.createElement('div')

      node.className = introClassName

      if (config.image) {
        const image = document.createElement('img')

        image.className = introImageClassName
        image.src = config.image
        image.alt = ''
        node.appendChild(image)
      }

      if (config.text) {
        const text = document.createElement('div')

        text.className = introTextClassName
        text.textContent = config.text
        node.appendChild(text)
      }

      art.template.$player.appendChild(node)
      layer = node

      timer = window.setTimeout(
        () => {
          node.classList.add(`${introClassName}--out`)
          timer = window.setTimeout(remove, 400)
        },
        Math.max(0, config.duration),
      )
    }

    const handlePlay = () => {
      if (config.delay > 0) {
        timer = window.setTimeout(show, config.delay)

        return
      }

      show()
    }

    if (config.once) art.once('play', handlePlay)
    else art.on('play', handlePlay)

    setting({
      html: introReplayText,
      icon: introIcon,
      onClick: () => {
        show()

        return ''
      },
    })

    onCleanup(() => {
      remove()
      art.off('play', handlePlay)
    })
  },
}
