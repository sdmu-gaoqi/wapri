import screenfull from 'screenfull'

/**
 * 全屏的快捷方法：省掉 `isEnabled` 判断，也不用在 `request` / `exit` / `toggle` 之间选。
 *
 * 注意区分：这里的 `on` / `off` 是「开启 / 关闭全屏」，
 * 事件监听仍然用 `screenfull.on('change', handler)`。
 */
export const fullscreen = {
  /** 当前环境是否允许全屏 */
  get isEnabled(): boolean {
    return Boolean(screenfull.isEnabled)
  },
  /** 当前是否处于全屏 */
  get isFullscreen(): boolean {
    return Boolean(screenfull.isFullscreen)
  },
  /** 开启全屏，成功返回 true；环境不支持时返回 false */
  on: async (element?: Element): Promise<boolean> => {
    if (!screenfull.isEnabled) return false
    await screenfull.request(element)
    return true
  },
  /** 关闭全屏，退出成功返回 true；本来就不在全屏时返回 false */
  off: async (): Promise<boolean> => {
    if (!screenfull.isEnabled || !screenfull.isFullscreen) return false
    await screenfull.exit()
    return true
  },
  /** 切换全屏，返回切换后是否全屏；环境不支持时返回 false */
  switch: async (element?: Element): Promise<boolean> => {
    if (!screenfull.isEnabled) return false
    await screenfull.toggle(element)
    return Boolean(screenfull.isFullscreen)
  },
}
