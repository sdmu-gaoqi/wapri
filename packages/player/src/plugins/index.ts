import { abLoopPlugin } from './abLoop'
import { aspectRatioPlugin } from './aspectRatio'
import { filterPlugin } from './filter'
import { flipPlugin } from './flip'
import { pipPlugin } from './pip'
import { playbackRatePlugin } from './playbackRate'
import { screenshotPlugin } from './screenshot'
import type { PluginDefinition } from '../types/plugin'

/** 内置插件，按右侧菜单的展示顺序排列 */
export const builtinPlugins: PluginDefinition[] = [
  playbackRatePlugin,
  aspectRatioPlugin,
  flipPlugin,
  screenshotPlugin,
  pipPlugin,
  abLoopPlugin,
  filterPlugin,
]

export { abLoopPlugin, aspectRatioPlugin, filterPlugin, flipPlugin, pipPlugin, playbackRatePlugin, screenshotPlugin }
