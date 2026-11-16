<script setup lang="ts" generic="T extends object, U extends Record<string, unknown>">
import { computed, h, nextTick, onMounted, ref, shallowRef, useId, watch, type Component } from 'vue'
import { makeSortableList, type MaybeElement } from '@vue-dnd-kit/core'
import ProTable from '../../ProTable/index.vue'
import DragSortTableHandle from './DragSortTableHandle.vue'
import DragSortTableOverlay from './DragSortTableOverlay.vue'
import SortableItemRegistrar from '../../shared/dnd/SortableItemRegistrar.vue'
import { getDataIndexKey, getRecordKey } from '../../ProTable/utils'
import { useConfig } from '../../ConfigProvider/context'
import type { ActionType, Key, ProColumn } from '../../ProTable/types'
import type { DragSortTableProps } from '../types'

/**
 * DragSortTable 的实现体：包在私有 `DnDProvider` 里，负责建列表、接管把手列、回写顺序。
 * 外层的 `index.vue` 只做 provider 包裹与 props / 插槽透传。
 */
const props = defineProps<DragSortTableProps<T, U>>()

const { prefix } = useConfig()

const rootRef = ref<HTMLElement>()
const proTableRef = ref<ActionType<T>>()
const tableElement = ref<HTMLElement>()

/**
 * 当前展示的数据。`ProTable` 的 dataSource 是内部状态，
 * 这里通过 `onDataSourceChange` 拿到一份引用，交给拖拽列表当数据源。
 */
const rows = shallowRef<T[]>([])
const sortableId = useId()

const rowKeyMap = computed(() => {
  const map = new Map<T, Key>()
  rows.value.forEach((row, index) => map.set(row, getRecordKey(row, index, props.rowKey)))
  return map
})

function handleDataSourceChange(data: T[]): void {
  rows.value = data
  props.onDataSourceChange?.(data)
}

/** `ElTable` 的 body 表格节点，拖拽列表把它当作测量与放置容器。 */
function syncTableElement(): void {
  tableElement.value = rootRef.value?.querySelector<HTMLElement>('table.el-table__body') ?? undefined
}

/** 第 index 行的 `<tr>`：DOM 行序与 `displayRows` 一致，直接按序号取。 */
function getRowElement(index: number): MaybeElement {
  return tableElement.value?.querySelectorAll<HTMLElement>(':scope > tbody > tr')[index] ?? undefined
}

/** 该行里的拖拽把手，只有它能起拖。 */
function getHandleElement(index: number): MaybeElement {
  const row = getRowElement(index)
  if (!(row instanceof HTMLElement)) return undefined
  return row.querySelector<HTMLElement>(`.${prefix.value}-drag-sort-table__handle`) ?? undefined
}

onMounted(syncTableElement)
watch(rows, () => void nextTick(syncTableElement))

/**
 * ProTable 在「无 request」时只用 props.dataSource，且换值时不会再走 onDataSourceChange，
 * 这里补一条同步，保证外部整体替换 dataSource 后拖拽仍以最新数据为准。
 */
watch(
  () => props.dataSource,
  (data) => {
    if (props.request || !data) return
    rows.value = data
  },
  { deep: true },
)

const sortableList = makeSortableList<T>(() => tableElement.value, {
  id: sortableId,
  items: rows,
  getKey: (row) => rowKeyMap.value.get(row) ?? 0,
  overlay: DragSortTableOverlay,
  axis: 'y',
  /**
   * 落点按「指针落在哪一行」算，不按「指针是否越过行的中点」算。
   *
   * `vertical` 策略比的是目标行的中点，把手又正好在行中间，所以要把指针拖过整整一行才换位，
   * 手感就是「拖到底才触发」；`grid` 策略只要指针进到某一行就取那一行的下标，进一行换一行。
   * 表格本身只有一列行，横向由 `axis: 'y'` 锁住（指针 x 固定为起拖位置），不会因为行宽或横向偏移误判。
   */
  strategy: 'grid',
  // 拖到表格外松手按取消处理，避免「拖出去也改了顺序」。
  dropOutside: 'cancel',
  onDrop: (event) => {
    const next = event.result.get(sortableId)
    if (!next) return
    rows.value = next
    // 等拖拽库把落点动画跑起来再换 DOM，否则行元素已重排、浮层会落错位置。
    void nextTick(() => {
      proTableRef.value?.setDataSource(next)
      void props.onDragSortEnd?.(event.from.index, event.to.index, next)
    })
  },
})

/**
 * 是否正在拖拽本表：库把当前项在草稿里的位置写进 `activeIndex`，
 * 拖拽结束或取消后变回 -1。
 */
const isSorting = computed(() => sortableList.activeIndex.value >= 0)

/**
 * 表格要展示的顺序：拖拽中跟着库的草稿走，其余时候就是源数据。
 * 拖拽库只负责算「这一行该插到第几」，不会自己搬 DOM；不按草稿渲染的话，
 * 拖拽期间其它行原地不动，只有松手才看到结果，手感就是「拖了半天没反应」。
 */
const displayRows = computed<T[]>(() => (isSorting.value ? sortableList.items.value : rows.value))

/** 草稿一变就把新顺序推给表格，让行跟着指针让位。 */
watch(
  () => sortableList.items.value,
  (next) => {
    if (!isSorting.value) return
    proTableRef.value?.setDataSource(next)
  },
)

/** 松手或取消：回到源数据为准，取消时草稿直接丢弃。 */
watch(isSorting, (value) => {
  if (value) return
  proTableRef.value?.setDataSource(rows.value)
})

const innerColumns = computed<ProColumn<T>[]>(() => {
  const dragSortKey = props.dragSortKey
  if (!dragSortKey) return props.columns
  return props.columns.map((column) => {
    if (getDataIndexKey(column.dataIndex) !== dragSortKey) return column
    return {
      ...column,
      render: (_value: unknown, record: T, index: number) =>
        // 把手是泛型组件，这里放宽成 Component 免得 h() 的泛型推断卡在 overload 上
        h(DragSortTableHandle as Component, {
          record,
          index,
          render: props.dragSortHandlerRender,
          disabled: props.dragSortDisabled,
        }),
    }
  })
})

/** 除拖拽相关的三个 props、columns 与数据回调外，其余原样透传给 ProTable。 */
const tableProps = computed(() => {
  const {
    columns: _columns,
    dragSortKey: _dragSortKey,
    dragSortHandlerRender: _dragSortHandlerRender,
    onDragSortEnd: _onDragSortEnd,
    dragSortDisabled: _dragSortDisabled,
    onDataSourceChange: _onDataSourceChange,
    ...rest
  } = props
  return rest
})

watch(
  [() => props.dragSortKey, () => props.columns],
  ([dragSortKey, columns]) => {
    if (!dragSortKey) return
    if (columns.some((column) => getDataIndexKey(column.dataIndex) === dragSortKey)) return
    console.warn(`[DragSortTable] columns 中没有 dataIndex 为 "${dragSortKey}" 的列，拖拽把手不会渲染。`)
  },
  { immediate: true },
)
</script>

<template>
  <div
    ref="rootRef"
    :class="`${prefix}-drag-sort-table`"
  >
    <ProTable
      ref="proTableRef"
      v-bind="tableProps"
      :columns="innerColumns"
      :on-data-source-change="handleDataSourceChange"
    >
      <template
        v-for="(_, slotName) in $slots"
        #[slotName]="slotProps"
      >
        <slot
          :name="slotName"
          v-bind="slotProps ?? {}"
        ></slot>
      </template>
    </ProTable>

    <SortableItemRegistrar
      v-for="(row, index) in displayRows"
      :key="String(rowKeyMap.get(row) ?? index)"
      :item="row"
      :target="() => getRowElement(index)"
      :handle="() => getHandleElement(index)"
      :disabled="dragSortDisabled"
    />
  </div>
</template>
