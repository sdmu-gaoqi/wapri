import { loadResource } from '@wapri/gutils'

/** 把单个地址或地址数组归一化为去空后的数组。 */
export function normalizeUrls(value: string | string[] | undefined): string[] {
  if (!value) return []
  const list = Array.isArray(value) ? value : [value]
  return list.map((item) => item.trim()).filter(Boolean)
}

/**
 * 加载单个远程资源。
 *
 * 走 `@wapri/gutils` 的 `loadResource`：`.css` 结尾按样式表处理、其余按脚本处理，
 * 同一地址已经加载成功时直接复用，不重复注入节点。
 */
export async function loadAsset(url: string): Promise<void> {
  if (typeof document === 'undefined' || !url) return

  try {
    const status = await loadResource(url)
    if (status !== 'error') return
  } catch {
    // loadResource 失败时 reject 的是字符串 'error'，统一在下面转成 Error
  }

  throw new Error(`[element-pro] 远程资源加载失败：${url}`)
}

/** 串行加载资源：UMD 之间存在依赖（如 react 先于 react-dom），不能并发。 */
export async function loadAssets(urls: readonly string[]): Promise<void> {
  for (const url of urls) {
    await loadAsset(url)
  }
}

/** 给加载任务加上超时，`timeout <= 0` 表示不限制。 */
export function withTimeout<T>(task: Promise<T>, timeout: number, message: string): Promise<T> {
  if (!timeout || timeout <= 0) return task

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeout)
    task.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (reason: unknown) => {
        clearTimeout(timer)
        reject(reason)
      },
    )
  })
}
