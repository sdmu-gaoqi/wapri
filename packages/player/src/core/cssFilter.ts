import type Artplayer from 'artplayer'
import type { CssFilterStack } from '../types/plugin'

export const createCssFilterStack = (art: Artplayer): CssFilterStack => {
  const parts = new Map<string, string>()

  const compose = () =>
    [...parts.values()]
      .map((item) => item.trim())
      .filter(Boolean)
      .join(' ')

  const apply = () => {
    art.video.style.filter = compose()
  }

  return {
    set: (key, fragment) => {
      parts.set(key, fragment)
      apply()
    },
    remove: (key) => {
      parts.delete(key)
      apply()
    },
    clear: () => {
      parts.clear()
      apply()
    },
    get value() {
      return compose()
    },
  }
}
