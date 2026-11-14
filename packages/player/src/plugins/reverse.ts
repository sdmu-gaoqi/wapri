import { defaultReverseRate, reverseLabel, reverseRateText } from '../constant'
import { reverseIcon } from '../constant/icons'
import type { PluginDefinition, ReverseConfig } from '../types/plugin'
import type { SettingOption } from 'artplayer'

/** 倒放可选速率 */
const reverseRates = [0.5, 1, 1.5, 2]

export const reversePlugin: PluginDefinition<ReverseConfig> = {
  key: 'reverse',
  label: reverseLabel,
  defaultConfig: {
    enabled: false,
    rate: defaultReverseRate,
  },
  install({ art, setting, onCleanup }, config) {
    let enabled = config.enabled
    let rate = config.rate
    let rafId = 0
    let last = 0
    let switchItem: SettingOption | undefined

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId)

      rafId = 0
    }

    const step = (now: number) => {
      const video = art.video
      const delta = Math.max(0, (now - last) / 1000)

      last = now

      const next = video.currentTime - delta * rate

      if (next > 0) {
        video.currentTime = next
        rafId = requestAnimationFrame(step)
        return
      }

      // 到头了：循环就跳回末尾继续倒，否则停在起点并关掉开关
      if (video.loop && art.duration > 0) {
        video.currentTime = art.duration
        rafId = requestAnimationFrame(step)
        return
      }

      video.currentTime = 0
      stop()

      enabled = false

      if (switchItem) switchItem.switch = false
    }

    const start = () => {
      // 倒放靠逐帧回退 currentTime，原生播放必须先停掉
      art.pause()
      stop()

      last = performance.now()
      rafId = requestAnimationFrame(step)
    }

    // 用户点播放时退出倒放，交回正常的正向播放
    const handlePlay = () => {
      if (!enabled) return

      enabled = false
      stop()

      if (switchItem) switchItem.switch = false
    }

    switchItem = setting({
      html: reverseLabel,
      icon: reverseIcon,
      switch: enabled,
      onSwitch: (item) => {
        const next = !item.switch

        enabled = next

        if (next) start()
        else stop()

        return next
      },
    })

    setting({
      html: reverseRateText,
      icon: reverseIcon,
      tooltip: `${rate}x`,
      selector: reverseRates.map((item) => ({
        html: `${item}x`,
        value: item,
        default: item === rate,
      })),
      onSelect: (selector) => {
        rate = Number(selector.value)

        return `${rate}x`
      },
    })

    art.on('play', handlePlay)

    if (enabled) start()

    onCleanup(() => {
      stop()
      art.off('play', handlePlay)
    })
  },
}
