import type Artplayer from 'artplayer'
import type { Setting, SettingOption } from 'artplayer'
import type { FrameRenderer, VideoFilterPreset } from './frame'

/** 插件配置的通用形态；具体插件在 `PluginConfigMap` 里声明自己的字段 */
export type PluginConfig = Record<string, unknown>

/** 倍速插件配置 */
export type PlaybackRateConfig = {
  /** 可选语速列表 */
  rates: number[]
  /** 初始语速 */
  defaultRate: number
}

/** 画面比例：`default` 跟随视频原始比例，其余按 `宽:高` 写法 */
export type AspectRatioValue = 'default' | `${number}:${number}`

/** 画面比例插件配置 */
export type AspectRatioConfig = {
  /** 可选比例列表，`default` 为跟随视频原始比例 */
  ratios: AspectRatioValue[]
  /** 初始比例 */
  defaultRatio: AspectRatioValue
}

/** 翻转方向 */
export type FlipMode = 'normal' | 'horizontal' | 'vertical'

/** 翻转插件配置 */
export type FlipConfig = {
  /** 可选方向列表 */
  modes: FlipMode[]
  /** 初始方向 */
  defaultMode: FlipMode
}

/** 截图输出格式 */
export type ScreenshotType = 'image/png' | 'image/jpeg' | 'image/webp'

/** 截图结果 */
export type ScreenshotResult = {
  /** `data:image/...;base64,...` 形式的图片数据 */
  dataUrl: string
  /** 截图时的播放进度（秒） */
  time: number
}

/** 截图插件配置 */
export type ScreenshotConfig = {
  /** 文件名前缀，最终文件名为 `${filename}_${播放时间}.${后缀}` */
  filename: string
  /** 图片格式 */
  type: ScreenshotType
  /** 图片质量 0–1，仅 `image/jpeg` 与 `image/webp` 生效 */
  quality: number
  /** 是否直接下载；为 `false` 时只通过 `onCapture` 回调 */
  download: boolean
  /** 截图完成回调，下载关闭时可用于自定义保存 */
  onCapture?: (result: ScreenshotResult) => void
}

/** 画中画插件配置 */
export type PipConfig = {
  /** 页面切到后台且正在播放时自动进入画中画 */
  autoEnter: boolean
}

/** AB 循环插件配置 */
export type AbLoopConfig = {
  /** 回跳时相对 B 点的提前量（秒），避免停在最后一帧 */
  offset: number
}

/** 画面调节插件配置 */
export type FilterConfig = {
  /** 初始亮度，100 为原始值 */
  brightness: number
  /** 初始对比度，100 为原始值 */
  contrast: number
  /** 初始饱和度，100 为原始值 */
  saturate: number
  /** 滑杆最小值 */
  min: number
  /** 滑杆最大值 */
  max: number
  /** 滑杆步长 */
  step: number
}

/** 网页全屏插件配置 */
export type WebFullscreenConfig = {
  /** 初始是否处于网页全屏 */
  defaultOn: boolean
}

/** 滑杆型配置的通用区间 */
export type RangeConfig = {
  /** 滑杆最小值 */
  min: number
  /** 滑杆最大值 */
  max: number
  /** 滑杆步长 */
  step: number
}

/** 马赛克插件配置 */
export type MosaicConfig = RangeConfig & {
  /** 初始是否启用 */
  enabled: boolean
  /** 初始块大小 */
  size: number
}

/** 防抖插件配置 */
export type StabilizerConfig = RangeConfig & {
  enabled: boolean
  /** 初始强度 0–1 */
  strength: number
}

/** 模糊插件配置 */
export type BlurConfig = RangeConfig & {
  enabled: boolean
  /** 初始模糊半径（px） */
  radius: number
}

/** 倒放插件配置 */
export type ReverseConfig = {
  /** 初始是否开启 */
  enabled: boolean
  /** 初始倒放速率，取 1 时与原速对齐 */
  rate: number
}

/** 背景模糊插件配置 */
export type BackgroundBlurConfig = RangeConfig & {
  enabled: boolean
  /** 初始模糊半径（px） */
  radius: number
}

/** 开场动画插件配置 */
export type IntroConfig = {
  /** 图片地址，留空只显示文字 */
  image: string
  /** 文案，留空只显示图片 */
  text: string
  /** 停留时长（毫秒） */
  duration: number
  /** 延迟出现（毫秒） */
  delay: number
  /** 是否只在首次播放时出现 */
  once: boolean
}

/** 视频叠加的素材类型 */
export type OverlayType = 'image' | 'video'

/** 视频叠加插件配置 */
export type OverlayConfig = {
  /** 素材地址，留空时菜单只给出提示 */
  src: string
  /** 素材类型 */
  type: OverlayType
  /** 中心点横向位置，0–100 */
  x: number
  /** 中心点纵向位置，0–100 */
  y: number
  /** 宽度占容器的百分比 */
  width: number
  /** 不透明度 0–1 */
  opacity: number
  /** 是否允许拖拽 */
  draggable: boolean
  /** 视频素材是否静音循环 */
  loop: boolean
}

/** 绿幕插件配置 */
export type ChromaKeyConfig = {
  enabled: boolean
  /** 被抠掉的颜色，`#rrggbb` */
  color: string
  /** 相似度 0–1 */
  similarity: number
  /** 边缘羽化 0–1 */
  smoothness: number
  similarityMin: number
  similarityMax: number
  smoothnessMin: number
  smoothnessMax: number
}

/** 视频滤镜插件配置 */
export type VideoFilterConfig = RangeConfig & {
  /** 初始预设 */
  preset: VideoFilterPreset
  /** 初始强度 0–1 */
  intensity: number
  /** 菜单里可选的预设 */
  presets: VideoFilterPreset[]
}

/** 横屏转竖屏的适配方式 */
export type VerticalMode = 'crop' | 'contain' | 'rotate'

/** 横屏转竖屏插件配置 */
export type VerticalConfig = {
  /** 初始是否启用 */
  enabled: boolean
  /** 初始适配方式 */
  mode: VerticalMode
  /** 目标容器比例，默认 `9:16` */
  ratio: AspectRatioValue
}

/** 内置插件的配置映射，`plugins` 数组据此推导 `setting` 的入参类型 */
export type PluginConfigMap = {
  playbackRate: PlaybackRateConfig
  aspectRatio: AspectRatioConfig
  flip: FlipConfig
  screenshot: ScreenshotConfig
  pip: PipConfig
  abLoop: AbLoopConfig
  filter: FilterConfig
  webFullscreen: WebFullscreenConfig
  mosaic: MosaicConfig
  stabilizer: StabilizerConfig
  blur: BlurConfig
  reverse: ReverseConfig
  backgroundBlur: BackgroundBlurConfig
  intro: IntroConfig
  overlay: OverlayConfig
  chromaKey: ChromaKeyConfig
  videoFilter: VideoFilterConfig
  vertical: VerticalConfig
}

/** 内置插件的 key */
export type BuiltinPluginKey = keyof PluginConfigMap

/**
 * 插件配置覆盖函数。
 * 入参是该插件的完整默认配置，返回值只需包含要改的字段。
 */
export type PluginSetting<T extends PluginConfig = PluginConfig> = (config: Readonly<T>) => Partial<T>

/** 单个插件条目 */
export type PluginEntry = {
  /** 插件 key，需已注册 */
  key: string
  /** 覆盖默认配置；不传则用默认配置 */
  setting?: PluginSetting
}

/**
 * `plugins` 的入参形态：
 * - 字符串：存在即启用，使用默认配置
 * - 对象：启用并按 `setting` 覆盖默认配置
 *
 * 需要在 `setting` 里读到带类型的配置时，用 `pluginEntry('key', (config) => ...)` 生成条目。
 */
export type PluginInput = string | PluginEntry

/** CSS filter 合成栈，多个插件各占一个 key，合成后统一写入 `video.style.filter` */
export interface CssFilterStack {
  /** 写入一个 key 的片段，空串视为移除 */
  set: (key: string, fragment: string) => void
  /** 移除某个 key 的片段 */
  remove: (key: string) => void
  /** 清空全部片段 */
  clear: () => void
  /** 当前合成后的 filter 值 */
  readonly value: string
}

/** 插件安装上下文 */
export interface PluginContext {
  /** artplayer 实例 */
  art: Artplayer
  /**
   * 往右侧设置菜单追加一项，返回菜单项本身。
   * 菜单项是可变对象，插件可以回写 `html` / `tooltip` / `switch` 同步状态。
   */
  setting: (option: Setting) => SettingOption
  /** 注册清理回调，组件卸载时先于 `destroy()` 执行 */
  onCleanup: (cleanup: () => void) => void
  /** 帧渲染器：需要逐帧改画面的插件通过它写效果，多个插件互不覆盖 */
  frame: FrameRenderer
  /** CSS filter 合成栈：写 `video.style.filter` 请走这里，避免插件之间互相覆盖 */
  cssFilter: CssFilterStack
}

/** 插件定义 */
export interface PluginDefinition<T extends PluginConfig = PluginConfig> {
  /** 唯一标识，`plugins` 里用它启用插件 */
  key: string
  /** 插件名，同时作为右侧菜单项文案 */
  label: string
  /** 默认配置，`setting` 在它之上覆盖 */
  defaultConfig: T
  /** 安装插件，实例就绪后调用 */
  install(context: PluginContext, config: T): void
}

/** 已解析、待安装的插件 */
export type ResolvedPlugin = {
  definition: PluginDefinition
  config: PluginConfig
}
