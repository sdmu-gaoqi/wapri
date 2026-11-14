import {
  chromaKeyLabel,
  chromaPickFailedText,
  chromaPickText,
  chromaPickTip,
  chromaSimilarityMax,
  chromaSimilarityMin,
  chromaSimilarityText,
  chromaSmoothnessMax,
  chromaSmoothnessMin,
  chromaSmoothnessText,
  defaultChromaColor,
  defaultChromaSimilarity,
  defaultChromaSmoothness,
} from '../constant'
import { chromaKeyIcon } from '../constant/icons'
import type { ChromaKeyConfig, PluginDefinition } from '../types/plugin'
import type { SettingOption } from 'artplayer'

export const chromaKeyPlugin: PluginDefinition<ChromaKeyConfig> = {
  key: 'chromaKey',
  label: chromaKeyLabel,
  defaultConfig: {
    enabled: false,
    color: defaultChromaColor,
    similarity: defaultChromaSimilarity,
    smoothness: defaultChromaSmoothness,
    similarityMin: chromaSimilarityMin,
    similarityMax: chromaSimilarityMax,
    smoothnessMin: chromaSmoothnessMin,
    smoothnessMax: chromaSmoothnessMax,
  },
  install({ art, frame, setting, onCleanup }, config) {
    let enabled = config.enabled
    let color = config.color
    let similarity = config.similarity
    let smoothness = config.smoothness
    let switchItem: SettingOption | undefined
    let pickItem: SettingOption | undefined
    let pickHandler: ((event: MouseEvent) => void) | undefined

    const apply = () => {
      frame.set('chromaKey', enabled ? { color, similarity, smoothness } : null)
    }

    const enable = () => {
      if (enabled) return

      enabled = true

      if (switchItem) switchItem.switch = true
    }

    const stopPick = () => {
      if (!pickHandler) return

      art.template.$player.removeEventListener('click', pickHandler, true)
      pickHandler = undefined
    }

    const startPick = () => {
      stopPick()

      art.notice.show = chromaPickTip

      pickHandler = (event: MouseEvent) => {
        // 取色优先于播放器自己的点击（播放 / 暂停）
        event.stopPropagation()
        stopPick()

        const picked = frame.pickColor(event.clientX, event.clientY)

        if (!picked) {
          art.notice.show = chromaPickFailedText

          return
        }

        color = picked

        if (pickItem) pickItem.tooltip = picked

        enable()
        apply()
      }

      art.template.$player.addEventListener('click', pickHandler, true)
    }

    switchItem = setting({
      html: chromaKeyLabel,
      icon: chromaKeyIcon,
      switch: enabled,
      onSwitch: (item) => {
        enabled = !item.switch
        apply()

        return enabled
      },
    })

    pickItem = setting({
      html: chromaPickText,
      icon: chromaKeyIcon,
      tooltip: color,
      onClick: () => {
        startPick()

        return color
      },
    })

    setting({
      html: chromaSimilarityText,
      icon: chromaKeyIcon,
      range: [similarity, config.similarityMin, config.similarityMax, 0.01],
      onChange: (item) => {
        similarity = Number(item.$range?.value ?? similarity)
        enable()
        apply()

        return `${Math.round(similarity * 100)}%`
      },
    })

    setting({
      html: chromaSmoothnessText,
      icon: chromaKeyIcon,
      range: [smoothness, config.smoothnessMin, config.smoothnessMax, 0.01],
      onChange: (item) => {
        smoothness = Number(item.$range?.value ?? smoothness)
        enable()
        apply()

        return `${Math.round(smoothness * 100)}%`
      },
    })

    apply()

    onCleanup(() => {
      stopPick()
      frame.set('chromaKey', null)
    })
  },
}
