import { createNProgress } from './create'
import './styles/index.scss'

export * from './types'
export { createNProgress }

/**
 * 全局单例：`NProgress.start()` / `NProgress.done()` 直接接进路由守卫或请求拦截器。
 * 需要与全局进度条并存的局部进度条时，用 `createNProgress({ parent })` 另建实例。
 */
export const NProgress = createNProgress()

export default NProgress
