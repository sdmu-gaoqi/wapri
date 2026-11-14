export { VideoPlayer, VideoPlayer as default } from './VideoPlayer'
export type { VideoPlayerInstance, VideoPlayerProps } from './VideoPlayer'

export { definePlugin, getPlugin, listPlugins, pluginEntry, registerPlugin, resolvePlugins } from './core/registry'
export { builtinPlugins } from './plugins'
export {
  abLoopPlugin,
  aspectRatioPlugin,
  filterPlugin,
  flipPlugin,
  pipPlugin,
  playbackRatePlugin,
  screenshotPlugin,
} from './plugins'
export { defaultPlayerRatio, packageName, prefix } from './constant'

export type {
  AbLoopConfig,
  AspectRatioConfig,
  AspectRatioValue,
  BuiltinPluginKey,
  FilterConfig,
  FlipConfig,
  FlipMode,
  PipConfig,
  PlaybackRateConfig,
  PluginConfig,
  PluginConfigMap,
  PluginContext,
  PluginDefinition,
  PluginEntry,
  PluginInput,
  PluginSetting,
  ResolvedPlugin,
  ScreenshotConfig,
  ScreenshotResult,
  ScreenshotType,
} from './types/plugin'
export type { PlayerOption, VideoPlayerEmits } from './types/player'
