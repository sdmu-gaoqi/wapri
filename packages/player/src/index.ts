export { VideoPlayer, VideoPlayer as default } from './VideoPlayer'
export type { VideoPlayerInstance, VideoPlayerProps } from './VideoPlayer'

export { definePlugin, getPlugin, listPlugins, pluginEntry, registerPlugin, resolvePlugins } from './core/registry'
export { builtinPlugins } from './plugins'
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
} from './plugins'
export { createCssFilterStack } from './core/cssFilter'
export { createFrameRenderer } from './core/frame'
export { defaultPlayerPlugins, defaultPlayerRatio, packageName, prefix } from './constant'
export { videoFilterPresetLabels, videoFilterPresetOrder, videoFilterPresets } from './constant'

export type {
  AbLoopConfig,
  AspectRatioConfig,
  AspectRatioValue,
  BackgroundBlurConfig,
  BlurConfig,
  BuiltinPluginKey,
  ChromaKeyConfig,
  CssFilterStack,
  FilterConfig,
  FlipConfig,
  FlipMode,
  IntroConfig,
  MosaicConfig,
  OverlayConfig,
  OverlayType,
  PipConfig,
  PlaybackRateConfig,
  PluginConfig,
  PluginConfigMap,
  PluginContext,
  PluginDefinition,
  PluginEntry,
  PluginInput,
  PluginSetting,
  RangeConfig,
  ResolvedPlugin,
  ReverseConfig,
  ScreenshotConfig,
  ScreenshotResult,
  ScreenshotType,
  StabilizerConfig,
  VerticalConfig,
  VerticalMode,
  VideoFilterConfig,
  WebFullscreenConfig,
} from './types/plugin'
export type {
  BackgroundBlurEffect,
  BlurEffect,
  ChromaKeyEffect,
  FrameEffectKey,
  FrameEffectMap,
  FrameFit,
  FrameRenderer,
  MosaicEffect,
  StabilizerEffect,
  VerticalEffect,
  VideoFilterEffect,
  VideoFilterPreset,
} from './types/frame'
export type { PlayerOption, VideoPlayerEmits } from './types/player'
