/**
 * Object URL 生命周期管理。
 *
 * 预览场景里 createObjectURL 常用于把 Blob 交给 iframe、video 或下载链接，
 * 忘记 revoke 会让 Blob 一直驻留内存，因此统一登记、统一释放。
 */

const registry = new Set<string>()

/** 创建并登记一个 Object URL */
export const createObjectUrl = (source: Blob | MediaSource): string => {
  const url = URL.createObjectURL(source)

  registry.add(url)

  return url
}

/** 释放单个 Object URL，未登记时保持静默 */
export const revokeObjectUrl = (url: string) => {
  if (!registry.delete(url)) return

  URL.revokeObjectURL(url)
}

/** 释放全部登记的 Object URL，页面切换时调用 */
export const revokeAllObjectUrls = () => {
  registry.forEach((url) => URL.revokeObjectURL(url))
  registry.clear()
}

/** 已登记但尚未释放的数量，便于排查泄漏 */
export const getObjectUrlCount = () => registry.size
