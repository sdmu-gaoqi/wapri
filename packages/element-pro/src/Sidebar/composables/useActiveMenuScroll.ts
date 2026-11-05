import { nextTick, onBeforeUnmount, onMounted, unref, watch, type Ref } from 'vue'

/** 侧栏当前高亮项选择器，覆盖分组导航、折叠态和经典 el-menu */
const ACTIVE_MENU_SELECTOR = [
  '.wa-ui-sidebar__link.is-active',
  '.wa-ui-sidebar__group-direct-link.is-active',
  '.wa-ui-sidebar__group-trigger.is-active',
  '.el-menu-item.is-active',
].join(', ')

/** 分组展开过渡约 150ms，延迟后再对齐一次，避免滚到折叠前的位置 */
const ACTIVE_MENU_ALIGN_DELAY_MS = 180

/** 判定高亮项是否可见时预留的上下内边距 */
const ACTIVE_MENU_VISIBLE_PADDING = 12

export interface UseActiveMenuScrollOptions {
  /** el-scrollbar 组件实例，`wrapRef` 在运行时可能已被 proxyRefs 解包 */
  scrollbarRef: Ref<{ wrapRef?: unknown } | undefined>
  /** 当前激活菜单路径 */
  activeMenu: Ref<string>
  /** 侧栏菜单数量，变化时重新对齐 */
  menuCount: Ref<number>
  /** 侧栏是否折叠 */
  collapse: Ref<boolean>
}

/** 取 el-scrollbar 的滚动容器元素 */
function resolveWrapElement(source: { wrapRef?: unknown } | undefined): HTMLElement | undefined {
  const wrap = unref(source?.wrapRef as HTMLElement | Ref<HTMLElement | undefined> | undefined)
  return wrap instanceof HTMLElement ? wrap : undefined
}

/** 将激活菜单滚动到可视区域，并在切换菜单、折叠侧栏时保持对齐 */
export function useActiveMenuScroll(options: UseActiveMenuScrollOptions): { alignActiveMenu: () => void } {
  const { scrollbarRef, activeMenu, menuCount, collapse } = options
  let alignTimer = 0

  function scrollWrapToActive(wrap: HTMLElement, activeEl: HTMLElement): void {
    const wrapRect = wrap.getBoundingClientRect()
    const elRect = activeEl.getBoundingClientRect()
    const isVisible =
      elRect.top >= wrapRect.top + ACTIVE_MENU_VISIBLE_PADDING &&
      elRect.bottom <= wrapRect.bottom - ACTIVE_MENU_VISIBLE_PADDING
    if (isVisible) return
    const current = wrap.scrollTop
    const elTop = elRect.top - wrapRect.top + current
    const target = elTop - (wrap.clientHeight - elRect.height) / 2
    const maxScroll = Math.max(0, wrap.scrollHeight - wrap.clientHeight)
    wrap.scrollTop = Math.min(maxScroll, Math.max(0, target))
  }

  function alignActiveMenu(): void {
    const wrap = resolveWrapElement(scrollbarRef.value)
    if (!wrap) return
    const activeEl = wrap.querySelector<HTMLElement>(ACTIVE_MENU_SELECTOR)
    if (!activeEl) return
    scrollWrapToActive(wrap, activeEl)
  }

  function scheduleAlign(): void {
    window.clearTimeout(alignTimer)
    void nextTick(() => {
      alignActiveMenu()
      alignTimer = window.setTimeout(alignActiveMenu, ACTIVE_MENU_ALIGN_DELAY_MS)
    })
  }

  watch([activeMenu, menuCount, collapse], scheduleAlign, { flush: 'post' })

  onMounted(scheduleAlign)

  onBeforeUnmount(() => {
    window.clearTimeout(alignTimer)
  })

  return { alignActiveMenu }
}
