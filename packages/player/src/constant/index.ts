import type { AspectRatioValue, FlipMode, PluginInput, ScreenshotType } from '../types/plugin'

export * from './effect'
export * from './filters'

/** 未传 `plugins` 时默认启用的插件：画面调节、截图、网页全屏、马赛克、模糊、绿幕 */
export const defaultPlayerPlugins: PluginInput[] = [
  'filter',
  'screenshot',
  'webFullscreen',
  'mosaic',
  'blur',
  'chromaKey',
]

/** 包名，用于日志与提示前缀 */
export const packageName = '@wapri/gplayer'

/** 组件类名前缀，同时用于根容器与自定义图标 */
export const prefix = 'wa-player'

/** 未传 `height` 时的容器比例 */
export const defaultPlayerRatio = '16 / 9'

/** 未传 `options` 时透传给 artplayer 的默认配置 */
export const defaultPlayerOption = {
  lang: 'zh-cn',
  // 右侧菜单是插件的载体，默认打开
  setting: true,
  fullscreen: true,
  miniProgressBar: true,
}

/** 倍速插件的默认语速列表 */
export const defaultPlaybackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

/** 倍速插件的默认语速 */
export const defaultPlaybackRate = 1

/** 画面比例插件的默认比例列表 */
export const defaultAspectRatios: AspectRatioValue[] = ['default', '16:9', '4:3', '21:9']

/** 画面比例插件的默认比例 */
export const defaultAspectRatio: AspectRatioValue = 'default'

/** 翻转插件的默认方向列表 */
export const defaultFlipModes: FlipMode[] = ['normal', 'horizontal', 'vertical']

/** 翻转插件的默认方向 */
export const defaultFlipMode: FlipMode = 'normal'

/** 截图插件的默认文件名前缀 */
export const defaultScreenshotName = 'screenshot'

/** 截图插件的默认图片格式 */
export const defaultScreenshotType = 'image/png'

/** 截图插件的默认图片质量，仅 jpeg / webp 生效 */
export const defaultScreenshotQuality = 0.92

/** 截图格式到文件后缀的映射 */
export const screenshotExtMap: Record<ScreenshotType, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

/** AB 循环插件默认的回跳提前量（秒） */
export const defaultAbLoopOffset = 0

/** 画面调节插件的默认取值与区间 */
export const defaultFilterValue = 100
export const defaultFilterMin = 0
export const defaultFilterMax = 200
export const defaultFilterStep = 1

/** 各插件在右侧菜单里的名称 */
export const playbackRateLabel = '播放速度'
export const aspectRatioLabel = '画面比例'
export const flipLabel = '画面翻转'
export const screenshotLabel = '截图'
export const pipLabel = '画中画'
export const abLoopLabel = 'AB 循环'
export const filterLabel = '画面调节'

/** AB 循环插件的菜单项文案 */
export const abLoopSetStartText = '设置 A 点'
export const abLoopSetEndText = '设置 B 点'
export const abLoopClearText = '清除 A-B'
export const abLoopEmptyTip = '未设置'
/** AB 循环里只设了一个点时的占位 */
export const abLoopUnsetText = '--:--'

/** 画面调节插件的菜单项文案 */
export const filterBrightnessText = '亮度'
export const filterContrastText = '对比度'
export const filterSaturateText = '饱和度'
export const filterResetText = '恢复默认'

/** 画中画插件的提示文案 */
export const pipUnsupportedText = '当前浏览器不支持画中画'

/** 截图插件的失败提示 */
export const screenshotFailedText = '截图失败，视频源需开启跨域（CORS）'
