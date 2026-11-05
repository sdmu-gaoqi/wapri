import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { StickyConfig } from '../types'

function resolveStickyConfig(sticky: boolean | StickyConfig | undefined): StickyConfig | false {
  if (!sticky) return false
  if (sticky === true) return { offsetHeader: 0, offsetScroll: 0 }
  return { offsetHeader: 0, offsetScroll: 0, ...sticky }
}

function getScrollContainer(config: StickyConfig | false): HTMLElement | Window {
  if (!config || !config.getContainer) return window
  return config.getContainer()
}

function getViewportBottom(container: HTMLElement | Window, offsetScroll: number): number {
  if (container === window) return window.innerHeight - offsetScroll
  const el = container as HTMLElement
  return el.getBoundingClientRect().bottom - offsetScroll
}

function getViewportTop(container: HTMLElement | Window): number {
  if (container === window) return 0
  return (container as HTMLElement).getBoundingClientRect().top
}

function findBodyScrollEl(tableEl: HTMLElement): HTMLElement | null {
  return (
    tableEl.querySelector<HTMLElement>('.el-table__body-wrapper .el-scrollbar__wrap') ||
    tableEl.querySelector<HTMLElement>('.el-table__body-wrapper')
  )
}

function findHeaderScrollEl(tableEl: HTMLElement): HTMLElement | null {
  return tableEl.querySelector<HTMLElement>('.el-table__header-wrapper')
}

/**
 * 对齐 ant-design Table sticky：
 * 1. 页面滚动时表头吸顶（CSS sticky + 祖先 overflow:visible）
 * 2. 表格横向溢出且底部滚出视口时，底部出现粘性滚动条并与表体同步
 */
export function useStickyTable(
  stickyProp: ComputedRef<boolean | StickyConfig | undefined>,
  tableWrapRef: Ref<HTMLElement | undefined>,
  observeTarget: Ref<unknown>,
  prefix: ComputedRef<string>,
) {
  const stickyConfig = computed(() => resolveStickyConfig(stickyProp.value))
  const stickyEnabled = computed(() => stickyConfig.value !== false)
  const stickyScrollRef = ref<HTMLElement>()
  const stickyScrollWidth = ref(0)
  const stickyScrollVisible = ref(false)
  let syncing = false
  let bodyScrollEl: HTMLElement | null = null
  let boundContainer: HTMLElement | Window | null = null
  let resizeObserver: ResizeObserver | null = null

  const stickyWrapClass = computed(() => (stickyEnabled.value ? `${prefix.value}-pro-table__table-wrap--sticky` : ''))

  const stickyWrapStyle = computed<Record<string, string> | undefined>(() => {
    const config = stickyConfig.value
    if (!config) return undefined
    return {
      '--sticky-offset-header': `${config.offsetHeader ?? 0}px`,
      '--sticky-offset-scroll': `${config.offsetScroll ?? 0}px`,
    }
  })

  function getTableEl(): HTMLElement | null {
    return tableWrapRef.value?.querySelector<HTMLElement>('.el-table') ?? null
  }

  function updateVisibility(): void {
    const wrap = tableWrapRef.value
    const body = bodyScrollEl
    const config = stickyConfig.value
    if (!wrap || !body || !config) {
      stickyScrollVisible.value = false
      return
    }
    const overflowX = body.scrollWidth > body.clientWidth + 1
    if (!overflowX) {
      stickyScrollVisible.value = false
      return
    }
    const rect = wrap.getBoundingClientRect()
    const offsetScroll = config.offsetScroll ?? 0
    const container = getScrollContainer(config)
    const viewportBottom = getViewportBottom(container, offsetScroll)
    const viewportTop = getViewportTop(container)
    stickyScrollVisible.value = rect.top < viewportBottom && rect.bottom > viewportTop
  }

  function updateMetrics(): void {
    if (!bodyScrollEl) {
      stickyScrollWidth.value = 0
      stickyScrollVisible.value = false
      return
    }
    stickyScrollWidth.value = bodyScrollEl.scrollWidth
    updateVisibility()
  }

  function onBodyScroll(): void {
    if (syncing) return
    const bar = stickyScrollRef.value
    if (!bodyScrollEl || !bar) return
    syncing = true
    bar.scrollLeft = bodyScrollEl.scrollLeft
    syncing = false
  }

  function onStickyScroll(): void {
    if (syncing) return
    const bar = stickyScrollRef.value
    const tableEl = getTableEl()
    if (!bodyScrollEl || !bar) return
    syncing = true
    bodyScrollEl.scrollLeft = bar.scrollLeft
    const header = tableEl ? findHeaderScrollEl(tableEl) : null
    if (header) header.scrollLeft = bar.scrollLeft
    syncing = false
  }

  function unbind(): void {
    if (bodyScrollEl) {
      bodyScrollEl.removeEventListener('scroll', onBodyScroll)
      bodyScrollEl = null
    }
    resizeObserver?.disconnect()
    resizeObserver = null
    if (boundContainer) {
      boundContainer.removeEventListener('scroll', updateVisibility)
      boundContainer = null
    }
    window.removeEventListener('resize', updateMetrics)
    stickyScrollWidth.value = 0
    stickyScrollVisible.value = false
  }

  function bind(): void {
    unbind()
    if (!stickyEnabled.value) return
    const tableEl = getTableEl()
    if (!tableEl) return
    bodyScrollEl = findBodyScrollEl(tableEl)
    if (bodyScrollEl) {
      bodyScrollEl.addEventListener('scroll', onBodyScroll, { passive: true })
    }
    if (typeof ResizeObserver !== 'undefined' && tableEl) {
      resizeObserver = new ResizeObserver(() => updateMetrics())
      resizeObserver.observe(tableEl)
      if (bodyScrollEl) resizeObserver.observe(bodyScrollEl)
    }
    boundContainer = getScrollContainer(stickyConfig.value)
    boundContainer.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateMetrics, { passive: true })
    updateMetrics()
  }

  onMounted(() => {
    void nextTick(() => bind())
  })

  watch(
    [stickyEnabled, observeTarget],
    () => {
      void nextTick(() => bind())
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => {
    unbind()
  })

  return {
    stickyEnabled,
    stickyConfig,
    stickyWrapClass,
    stickyWrapStyle,
    stickyScrollRef,
    stickyScrollWidth,
    stickyScrollVisible,
    onStickyScroll,
  }
}
