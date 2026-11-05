import type { SidebarLinkTarget, SidebarMenuItem } from './types'

/** 判断路径是否为外部链接（http/https/mailto/tel） */
export function isExternalPath(path: unknown): boolean {
  return typeof path === 'string' && /^(https?:|mailto:|tel:)/.test(path)
}

/** 去掉路径中重复的斜杠与结尾斜杠 */
export function normalizePath(path: string): string {
  if (!path) return path
  const normalized = path.replace('//', '/')
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized
}

/** 基于父级路径拼接出完整路由路径，外部链接原样返回 */
export function resolveMenuPath(basePath: string | undefined, routePath: string | undefined): string {
  if (!routePath) return basePath || '/'
  if (isExternalPath(routePath)) return routePath
  if (routePath.startsWith('/')) return normalizePath(routePath)
  const base = basePath ? (basePath.startsWith('/') ? basePath : `/${basePath}`) : ''
  return normalizePath(`${base}/${routePath}`)
}

/** 解析菜单项中 JSON 字符串形式的 query，解析失败时返回 undefined */
export function parseMenuQuery(query: string | undefined): Record<string, unknown> | undefined {
  if (!query) return undefined
  try {
    const parsed: unknown = JSON.parse(query)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>
    return undefined
  } catch {
    return undefined
  }
}

/** 拼接菜单跳转目标，带 query 时返回对象形式 */
export function createLinkTarget(
  basePath: string | undefined,
  routePath: string | undefined,
  query?: string,
): SidebarLinkTarget {
  if (isExternalPath(routePath)) return routePath as string
  if (isExternalPath(basePath)) return basePath as string
  const fullPath = resolveMenuPath(basePath, routePath)
  const parsedQuery = parseMenuQuery(query)
  if (parsedQuery) return { path: fullPath, query: parsedQuery }
  return fullPath
}

/** 取跳转目标中的路径字符串 */
export function getLinkPath(target: SidebarLinkTarget): string {
  return typeof target === 'string' ? target : target.path
}

/** 过滤掉隐藏菜单，并按路径、标题去重，避免后端重复菜单导致侧栏出现重复项 */
export function dedupeMenus(menus: SidebarMenuItem[] | undefined): SidebarMenuItem[] {
  const result: SidebarMenuItem[] = []
  const seenPath = new Set<string>()
  const seenTitle = new Set<string>()
  ;(menus || []).forEach((menu) => {
    if (!menu || menu.hidden) return
    const pathKey = menu.path == null ? '' : String(menu.path)
    const title = menu.meta?.title || ''
    if (pathKey !== '' && pathKey !== '/') {
      if (seenPath.has(pathKey)) return
      seenPath.add(pathKey)
    }
    if (title) {
      if (seenTitle.has(title)) return
      seenTitle.add(title)
    }
    result.push(menu)
  })
  return result
}
