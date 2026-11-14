import type { Option } from 'artplayer'
import { defaultPlayerOption } from '../constant'
import type { VideoPlayerProps } from '../types/player'

type PluginRunner = Option['plugins']

/** 去掉 undefined 的键，避免把 artplayer 的默认值覆盖成空值 */
const compact = <T extends object>(source: T): T =>
  Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined)) as T

/**
 * 合并出 artplayer 的初始化配置。
 * 优先级：组件默认值 < `options` < 顶层 props。
 */
export const resolveOption = (props: VideoPlayerProps, container: HTMLDivElement, plugins: PluginRunner): Option => {
  const option = compact({
    ...defaultPlayerOption,
    ...props.options,
    url: props.url,
    poster: props.poster ?? props.options?.poster,
    theme: props.theme ?? props.options?.theme,
    lang: props.lang ?? props.options?.lang,
    autoplay: props.autoplay ?? props.options?.autoplay,
    muted: props.muted ?? props.options?.muted,
    loop: props.loop ?? props.options?.loop,
    volume: props.volume ?? props.options?.volume,
    container,
    plugins,
  })

  return option as Option
}
