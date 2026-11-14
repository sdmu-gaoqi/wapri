import type Artplayer from 'artplayer'
import type { Option } from 'artplayer'
import type { FlipMode, PluginInput } from './plugin'

/** 透传给 artplayer 的原生配置；容器、地址与插件由组件接管 */
export type PlayerOption = Omit<Partial<Option>, 'container' | 'plugins' | 'url'>

/** 视频播放器属性 */
export type VideoPlayerProps = {
  /** 视频地址 */
  url: string
  /** 封面图 */
  poster?: string
  /** 主题色，同时影响进度条与高亮 */
  theme?: string
  /** 提示语言，artplayer 内置 `zh-cn`，其余语言用 `artplayer/i18n/*` 自行注入 */
  lang?: string
  /** 是否自动播放；浏览器策略可能要求同时 `muted` */
  autoplay?: boolean
  /** 是否静音 */
  muted?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 初始音量，取值 0–1 */
  volume?: number
  /** 容器高度，数字按 px；不传时按 16:9 自适应宽度 */
  height?: number | string
  /** 插件配置，见 README 的「插件」一节 */
  plugins?: PluginInput[]
  /** 其余 artplayer 配置原样透传 */
  options?: PlayerOption
}

/** 组件实例方法 */
export type VideoPlayerInstance = {
  /** 原始 artplayer 实例，未就绪时为 undefined */
  readonly player: Artplayer | undefined
  /** 播放 */
  play: () => Promise<void> | undefined
  /** 暂停 */
  pause: () => void
  /** 播放 / 暂停切换 */
  toggle: () => void
  /** 跳转到指定秒数 */
  seek: (time: number) => void
  /** 截图，返回 dataURL */
  screenshot: (name?: string) => Promise<string> | undefined
  /** 进入 / 退出全屏，不传则切换 */
  fullscreen: (state?: boolean) => void
}

/** 组件事件，参数与 artplayer 原始事件一致 */
export interface VideoPlayerEmits {
  (event: 'ready'): void
  (event: 'play'): void
  (event: 'pause'): void
  (event: 'ended'): void
  (event: 'timeupdate'): void
  (event: 'volumechange'): void
  (event: 'ratechange'): void
  (event: 'seek', currentTime: number, time: number): void
  (event: 'error', error: Error, reconnectTime: number): void
  (event: 'flip', mode: FlipMode): void
  (event: 'pip', state: boolean): void
  (event: 'screenshot', dataUri: string): void
  (event: 'fullscreen', state: boolean): void
  (event: 'fullscreen-web', state: boolean): void
  (event: 'destroy'): void
}
