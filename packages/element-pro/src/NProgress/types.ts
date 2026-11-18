/**
 * 顶部进度条的配置项，语义与 nprogress 的 `configure` 对齐。
 * 所有字段都可省略，未传时取 `constant/index.ts` 的 `nprogressDefaults`。
 */
export interface NProgressOptions {
  /** 起始进度，同时是 `set()` 的下限，默认 0.08 */
  minimum?: number
  /** 进度上限，到达即视为完成，默认 1 */
  maximum?: number
  /** 是否自动递增，默认 true */
  trickle?: boolean
  /** 自动递增间隔（ms），默认 200 */
  trickleSpeed?: number
  /** 是否显示右上角转圈，默认 true */
  showSpinner?: boolean
  /** 进度动画与淡出时长（ms），默认 200 */
  speed?: number
  /** 进度过渡曲线，默认 ease */
  easing?: string
  /** 挂载父元素，默认 body；传选择器或元素时按局部进度条渲染 */
  parent?: string | HTMLElement | null
  /** 层级，默认 2000 */
  zIndex?: number
  /** 进度条颜色，默认跟随 --el-color-primary */
  color?: string
}

/** 补全默认值后的配置。 */
export interface NProgressSettings extends Required<Omit<NProgressOptions, 'parent'>> {
  parent: string | HTMLElement | null
}

/** 单例或 `createNProgress()` 返回的实例。 */
export interface NProgressInstance {
  /** 当前进度，未开始时为 null */
  readonly status: number | null
  /** 当前配置（补全默认值后的副本） */
  readonly settings: NProgressSettings
  /** 开始，重复调用不会回退进度 */
  start: () => NProgressInstance
  /** 完成：推进到 100% 后淡出并移除节点 */
  done: (force?: boolean) => NProgressInstance
  /** 递增，未开始时等价于 `start()` */
  inc: (amount?: number) => NProgressInstance
  /** 设置绝对值，到达上限等价于 `done()` */
  set: (value: number) => NProgressInstance
  /** 递增一档，与 `inc()` 等价 */
  trickle: () => NProgressInstance
  /** 合并配置，已挂载的进度条立即生效 */
  configure: (options: NProgressOptions) => NProgressInstance
  /** 是否已经开始且未完成 */
  isStarted: () => boolean
  /** 立即移除节点与定时器 */
  remove: () => NProgressInstance
}
