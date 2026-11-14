import Artplayer from 'artplayer'
import { downloadBlob } from '@wapri/gbase'
import {
  defaultScreenshotName,
  defaultScreenshotQuality,
  defaultScreenshotType,
  packageName,
  screenshotExtMap,
  screenshotFailedText,
  screenshotLabel,
} from '../constant'
import { cloneIcon } from '../core/icon'
import type { PluginDefinition, ScreenshotConfig, ScreenshotResult } from '../types/plugin'

/** 文件名里的时间片段：00:00:03 → 00-00-03 */
const toFileTime = (time: number) => Artplayer.utils.secondToTime(time).replace(/:/g, '-')

/**
 * 重绘视频帧。
 * 不用 `art.screenshot()`：它只输出 png、文件名固定，也不带画面调节插件的滤镜。
 */
const captureFrame = (video: HTMLVideoElement, config: ScreenshotConfig): ScreenshotResult | null => {
  if (!video.videoWidth || !video.videoHeight) return null

  const canvas = document.createElement('canvas')

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const context = canvas.getContext('2d')

  if (!context) return null

  const filter = video.style.filter

  if (filter) {
    context.filter = filter
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  return { dataUrl: canvas.toDataURL(config.type, config.quality), time: video.currentTime }
}

export const screenshotPlugin: PluginDefinition<ScreenshotConfig> = {
  key: 'screenshot',
  label: screenshotLabel,
  defaultConfig: {
    filename: defaultScreenshotName,
    type: defaultScreenshotType,
    quality: defaultScreenshotQuality,
    download: true,
  },
  install({ art, setting }, config) {
    const formatType = () => config.type.replace('image/', '').toUpperCase()

    setting({
      html: art.i18n.get('Screenshot'),
      icon: cloneIcon(art.icons.screenshot),
      tooltip: formatType(),
      onClick: async () => {
        try {
          const result = captureFrame(art.video, config)

          if (!result) return formatType()

          if (config.download) {
            const blob = await (await fetch(result.dataUrl)).blob()

            downloadBlob(`${config.filename}_${toFileTime(result.time)}.${screenshotExtMap[config.type]}`, blob)
          }

          config.onCapture?.(result)
          art.emit('screenshot', result.dataUrl)
        } catch (error) {
          // 跨域视频会污染 canvas，toDataURL 抛 SecurityError
          console.warn(`[${packageName}] ${screenshotFailedText}`, error)
          art.notice.show = screenshotFailedText
        }

        // 返回值会写回菜单项右侧的副标题
        return formatType()
      },
    })
  },
}
