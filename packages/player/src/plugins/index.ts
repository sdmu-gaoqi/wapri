import { abLoopPlugin } from './abLoop'
import { aspectRatioPlugin } from './aspectRatio'
import { backgroundBlurPlugin } from './backgroundBlur'
import { blurPlugin } from './blur'
import { chromaKeyPlugin } from './chromaKey'
import { filterPlugin } from './filter'
import { flipPlugin } from './flip'
import { introPlugin } from './intro'
import { mosaicPlugin } from './mosaic'
import { overlayPlugin } from './overlay'
import { pipPlugin } from './pip'
import { playbackRatePlugin } from './playbackRate'
import { reversePlugin } from './reverse'
import { screenshotPlugin } from './screenshot'
import { stabilizerPlugin } from './stabilizer'
import { verticalPlugin } from './vertical'
import { videoFilterPlugin } from './videoFilter'
import { webFullscreenPlugin } from './webFullscreen'
import type { PluginDefinition } from '../types/plugin'

/** 内置插件，按右侧菜单的展示顺序排列 */
export const builtinPlugins: PluginDefinition[] = [
  playbackRatePlugin,
  aspectRatioPlugin,
  flipPlugin,
  webFullscreenPlugin,
  screenshotPlugin,
  pipPlugin,
  abLoopPlugin,
  filterPlugin,
  videoFilterPlugin,
  mosaicPlugin,
  blurPlugin,
  backgroundBlurPlugin,
  stabilizerPlugin,
  chromaKeyPlugin,
  verticalPlugin,
  reversePlugin,
  introPlugin,
  overlayPlugin,
]

export {
  abLoopPlugin,
  aspectRatioPlugin,
  backgroundBlurPlugin,
  blurPlugin,
  chromaKeyPlugin,
  filterPlugin,
  flipPlugin,
  introPlugin,
  mosaicPlugin,
  overlayPlugin,
  pipPlugin,
  playbackRatePlugin,
  reversePlugin,
  screenshotPlugin,
  stabilizerPlugin,
  verticalPlugin,
  videoFilterPlugin,
  webFullscreenPlugin,
}
