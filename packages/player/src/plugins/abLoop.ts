import Artplayer from 'artplayer'
import {
  abLoopClearText,
  abLoopEmptyTip,
  abLoopLabel,
  abLoopSetEndText,
  abLoopSetStartText,
  abLoopUnsetText,
  defaultAbLoopOffset,
} from '../constant'
import { abLoopIcon } from '../constant/icons'
import type { AbLoopConfig, PluginDefinition } from '../types/plugin'

const formatPoint = (time: number | null) => (time === null ? abLoopUnsetText : Artplayer.utils.secondToTime(time))

export const abLoopPlugin: PluginDefinition<AbLoopConfig> = {
  key: 'abLoop',
  label: abLoopLabel,
  defaultConfig: {
    offset: defaultAbLoopOffset,
  },
  install({ art, setting, onCleanup }, config) {
    let startTime: number | null = null
    let endTime: number | null = null

    const formatRange = () => {
      if (startTime === null && endTime === null) return abLoopEmptyTip

      return `${formatPoint(startTime)} - ${formatPoint(endTime)}`
    }

    setting({
      html: abLoopLabel,
      icon: abLoopIcon,
      tooltip: abLoopEmptyTip,
      selector: [
        { html: abLoopSetStartText, value: 'start' },
        { html: abLoopSetEndText, value: 'end' },
        { html: abLoopClearText, value: 'clear' },
      ],
      onSelect: (selector) => {
        const action = String(selector.value)
        const current = art.currentTime

        if (action === 'start') {
          startTime = current
          // A 点越过 B 点时，原来的区间失效
          if (endTime !== null && endTime <= startTime) endTime = null
        }

        if (action === 'end') {
          endTime = current
          if (startTime !== null && endTime <= startTime) startTime = null
        }

        if (action === 'clear') {
          startTime = null
          endTime = null
        }

        art.notice.show = formatRange()

        return formatRange()
      },
    })

    const handleTimeUpdate = () => {
      if (startTime === null || endTime === null) return

      if (art.currentTime >= endTime - config.offset) {
        art.currentTime = startTime
      }
    }

    art.on('video:timeupdate', handleTimeUpdate)
    onCleanup(() => art.off('video:timeupdate', handleTimeUpdate))
  },
}
