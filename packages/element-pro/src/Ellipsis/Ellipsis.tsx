import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useConfig } from '../ConfigProvider/context'
import type { EllipsisActionPropagationEvent, EllipsisDirection, EllipsisExpandInfo, EllipsisProps } from './types'
import './styles/index.scss'

enum MeasureStatus {
  Prepare,
  Walking,
  StableEllipsis,
  StableNoEllipsis,
}

const ELLIPSIS_TEXT = '...'

export default defineComponent({
  name: 'Ellipsis',
  props: {
    content: { type: String, default: '' },
    direction: { type: String as () => EllipsisDirection, default: 'end' },
    rows: { type: Number, default: 1 },
    expandText: { type: null, default: undefined },
    collapseText: { type: null, default: undefined },
    stopPropagationForActionButtons: { type: Array as () => EllipsisActionPropagationEvent[], default: () => [] },
    defaultExpanded: { type: Boolean, default: false },
  },
  emits: {
    expand: (_expanded: boolean, _info: EllipsisExpandInfo): boolean => true,
    contentClick: (_event: MouseEvent): boolean => true,
  },
  setup(props: EllipsisProps, { emit }) {
    const { prefix } = useConfig()
    const rootRef = ref<HTMLElement>()
    const fullMeasureRef = ref<HTMLElement>()
    const rowMeasureRef = ref<HTMLElement>()
    const walkingMeasureRef = ref<HTMLElement>()
    const status = ref(MeasureStatus.Prepare)
    const expanded = ref(false)
    const maxHeight = ref(0)
    const walkStart = ref(0)
    const walkEnd = ref(0)
    const measurementId = ref(0)
    let resizeObserver: ResizeObserver | undefined
    let observedWidth = 0

    const base = computed(() => `${prefix.value}-ellipsis`)
    const text = computed(() => props.content ?? '')
    const characters = computed(() => Array.from(text.value))
    const normalizedRows = computed(() => {
      const rows = props.rows ?? 1
      return Number.isFinite(rows) ? Math.max(1, Math.floor(rows)) : 1
    })
    const direction = computed<EllipsisDirection>(() => props.direction ?? 'end')
    const midpoint = computed(() => Math.ceil((walkStart.value + walkEnd.value) / 2))

    function shouldStopPropagation(eventName: EllipsisActionPropagationEvent): boolean {
      return props.stopPropagationForActionButtons?.includes(eventName) ?? false
    }

    function stopActionPropagation(event: Event, eventName: EllipsisActionPropagationEvent): void {
      if (shouldStopPropagation(eventName)) event.stopPropagation()
    }

    function handleExpand(nextExpanded: boolean, event: MouseEvent): void {
      stopActionPropagation(event, 'click')
      expanded.value = nextExpanded
      emit('expand', nextExpanded, { event })
    }

    function renderAction(nextExpanded: boolean) {
      const actionText = nextExpanded ? props.expandText : props.collapseText
      if (actionText === undefined || actionText === null || actionText === '') return null
      const actionName = nextExpanded ? 'expand' : 'collapse'
      return h(
        'button',
        {
          'type': 'button',
          'class': `${base.value}__action ${base.value}__action--${actionName}`,
          'aria-label': actionName === 'expand' ? '展开' : '收起',
          'onClick': (event: MouseEvent) => handleExpand(nextExpanded, event),
          'onMousedown': (event: MouseEvent) => stopActionPropagation(event, 'mousedown'),
          'onMouseup': (event: MouseEvent) => stopActionPropagation(event, 'mouseup'),
          'onTouchstart': (event: TouchEvent) => stopActionPropagation(event, 'touchstart'),
          'onTouchend': (event: TouchEvent) => stopActionPropagation(event, 'touchend'),
        },
        [actionText],
      )
    }

    function renderTruncatedContent(index: number) {
      const head = characters.value.slice(0, index).join('')
      const tail = characters.value.slice(characters.value.length - index).join('')
      const expandAction = renderAction(true)
      if (direction.value === 'start') return [expandAction, ELLIPSIS_TEXT, tail]
      if (direction.value === 'middle') return [head, ELLIPSIS_TEXT, expandAction, ELLIPSIS_TEXT, tail]
      return [head, ELLIPSIS_TEXT, expandAction]
    }

    function measureWalking(id: number): void {
      if (id !== measurementId.value || status.value !== MeasureStatus.Walking) return
      const difference = walkEnd.value - walkStart.value
      const height = walkingMeasureRef.value?.offsetHeight ?? 0
      if (difference > 1) {
        if (height > maxHeight.value) walkEnd.value = midpoint.value
        else walkStart.value = midpoint.value
      } else {
        if (height > maxHeight.value) walkEnd.value = walkStart.value
        else walkStart.value = walkEnd.value
        status.value = MeasureStatus.StableEllipsis
        return
      }
      void nextTick(() => measureWalking(id))
    }

    function measurePrepared(id: number): void {
      if (id !== measurementId.value || status.value !== MeasureStatus.Prepare) return
      const fullHeight = fullMeasureRef.value?.offsetHeight ?? 0
      const rowHeight = rowMeasureRef.value?.offsetHeight ?? 0
      const availableHeight = rowHeight * (normalizedRows.value + 0.5)
      if (fullHeight <= availableHeight) {
        status.value = MeasureStatus.StableNoEllipsis
        return
      }
      maxHeight.value = availableHeight
      status.value = MeasureStatus.Walking
      void nextTick(() => measureWalking(id))
    }

    function scheduleMeasurement(): void {
      const id = measurementId.value + 1
      measurementId.value = id
      walkStart.value = 0
      walkEnd.value = direction.value === 'middle' ? Math.ceil(characters.value.length / 2) : characters.value.length
      status.value = MeasureStatus.Prepare
      void nextTick(() => measurePrepared(id))
    }

    function handleContentClick(event: MouseEvent): void {
      if (event.target === event.currentTarget) emit('contentClick', event)
    }

    watch(
      () => [text.value, normalizedRows.value, direction.value, props.expandText, props.collapseText, expanded.value],
      scheduleMeasurement,
      { flush: 'post' },
    )

    onMounted(() => {
      expanded.value = props.defaultExpanded ?? false
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver((entries) => {
          const width = entries[0]?.contentRect.width
          if (width === undefined || width === observedWidth) return
          observedWidth = width
          scheduleMeasurement()
        })
        if (rootRef.value) {
          observedWidth = rootRef.value.clientWidth
          resizeObserver.observe(rootRef.value)
        }
      }
      scheduleMeasurement()
    })

    onBeforeUnmount(() => resizeObserver?.disconnect())

    return () => {
      const content =
        expanded.value || status.value === MeasureStatus.StableNoEllipsis
          ? [text.value, status.value === MeasureStatus.StableEllipsis ? renderAction(false) : null]
          : status.value === MeasureStatus.StableEllipsis
            ? renderTruncatedContent(midpoint.value)
            : null
      return h(
        'div',
        {
          ref: rootRef,
          class: base.value,
          onClick: handleContentClick,
        },
        [
          status.value === MeasureStatus.Prepare
            ? h('span', { ref: fullMeasureRef, class: `${base.value}__measure` }, [text.value, renderAction(true)])
            : null,
          status.value === MeasureStatus.Prepare
            ? h('span', { ref: rowMeasureRef, class: `${base.value}__measure` }, '\u00A0')
            : null,
          status.value === MeasureStatus.Walking
            ? h(
                'span',
                { ref: walkingMeasureRef, class: `${base.value}__measure` },
                renderTruncatedContent(midpoint.value),
              )
            : null,
          content,
        ],
      )
    }
  },
})
