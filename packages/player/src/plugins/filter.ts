import {
  defaultFilterMax,
  defaultFilterMin,
  defaultFilterStep,
  defaultFilterValue,
  filterBrightnessText,
  filterContrastText,
  filterLabel,
  filterResetText,
  filterSaturateText,
} from '../constant'
import { filterIcon } from '../constant/icons'
import type { FilterConfig, PluginDefinition } from '../types/plugin'
import type { SettingOption } from 'artplayer'

/** 可调节的画面参数 */
const filterKeys = ['brightness', 'contrast', 'saturate'] as const

type FilterKey = (typeof filterKeys)[number]

const filterTexts: Record<FilterKey, string> = {
  brightness: filterBrightnessText,
  contrast: filterContrastText,
  saturate: filterSaturateText,
}

export const filterPlugin: PluginDefinition<FilterConfig> = {
  key: 'filter',
  label: filterLabel,
  defaultConfig: {
    brightness: defaultFilterValue,
    contrast: defaultFilterValue,
    saturate: defaultFilterValue,
    min: defaultFilterMin,
    max: defaultFilterMax,
    step: defaultFilterStep,
  },
  install({ art, setting, onCleanup }, config) {
    const state: Record<FilterKey, number> = {
      brightness: config.brightness,
      contrast: config.contrast,
      saturate: config.saturate,
    }
    const entries: Array<{ key: FilterKey; item: SettingOption }> = []

    const apply = () => {
      art.video.style.filter = filterKeys.map((key) => `${key}(${state[key]}%)`).join(' ')
    }

    filterKeys.forEach((key) => {
      const item = setting({
        html: filterTexts[key],
        icon: filterIcon,
        range: [state[key], config.min, config.max, config.step],
        // 返回值会写回菜单项右侧的副标题
        onChange: (option) => {
          state[key] = Number(option.$range?.value ?? state[key])
          apply()

          return `${state[key]}%`
        },
      })

      entries.push({ key, item })
    })

    setting({
      html: filterResetText,
      icon: filterIcon,
      tooltip: `${config.brightness}%`,
      onClick: () => {
        filterKeys.forEach((key) => {
          state[key] = config[key]
        })
        entries.forEach(({ key, item }) => {
          if (item.$range) item.$range.value = String(state[key])
        })
        apply()

        // 返回值会写回菜单项右侧的副标题
        return `${config.brightness}%`
      },
    })

    apply()

    onCleanup(() => {
      art.video.style.filter = ''
    })
  },
}
