<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, type CSSProperties } from 'vue'
import WaFilterSummary from './WaFilterSummary.vue'
import { getFilterControl } from './useFilterControls'
import { compactModel, createSummaryChips, formatFilterValue, isFieldInline } from './useFilterModel'
import type { FilterBarModel, FilterField, FilterValue, WaFilterBarEmits, WaFilterBarProps } from './types'

defineOptions({ name: 'WaFilterBar' })

const props = withDefaults(defineProps<WaFilterBarProps>(), {
  modelValue: () => ({}),
  inlineKeys: undefined,
  expandText: '筛选',
  confirmText: '确定',
  resetText: '重置',
  showReset: true,
  showSummary: false,
  collapsible: true,
  autoConfirm: false,
})
const emit = defineEmits<WaFilterBarEmits>()

const panelVisible = ref(false)
/** 当前展开的字段；null 表示点了「筛选」，面板里是全部字段 */
const activeKey = ref<string | null>(null)
/** 字段下拉的锚点：只记左边界，贴着触发器展开后统一夹进筛选条内 */
const dropdownAnchor = ref<{ left: number }>({ left: 0 })
/** 筛选条根节点：点击外部时关闭面板，teleport 出去的 popup 单独放行 */
const triggerRoot = ref<HTMLElement | null>(null)
const draft = reactive<FilterBarModel>({})
const committed = ref<FilterBarModel>({})

const syncDraft = (value: FilterBarModel) => {
  for (const key of Object.keys(draft)) delete draft[key]
  Object.assign(draft, compactModel(value))
}

// 父组件重置、回填（列表页常见：把筛选条件同步到 URL）时保持同步；
// deep 是必须的，区间与多选值都是对象/数组引用
watch(
  () => props.modelValue,
  (value) => {
    committed.value = compactModel(value)
    syncDraft(value)
  },
  { deep: true, immediate: true },
)

/** 筛选条上的触发器字段：`inline` 的字段直接在条上露一个「值 ▾」 */
const triggerFields = computed(() => props.fields.filter((field) => isFieldInline(field, props.inlineKeys)))
const summaryChips = computed(() => createSummaryChips(props.fields, draft))
/**
 * 当前条件数：跟面板里看到的一致。
 *
 * 不能只算「已提交」的那一份——面板里清空某项（比如级联弹层里的重置）只改草稿，
 * 若还按已提交值高亮，就会出现「面板里明明没值了、筛选还亮着」。面板收起时草稿会被丢弃/回填，
 * 两者自然一致。
 */
const activeCount = computed(() => summaryChips.value.length)

/** 面板内容：点了某个触发器就只放这一个字段，点「筛选」才放全部 */
const panelFields = computed<FilterField[]>(() => {
  if (activeKey.value === null) return props.fields

  return props.fields.filter((field) => field.key === activeKey.value)
})

const activeField = computed(() => props.fields.find((field) => field.key === activeKey.value))
/** 单选选项点完就走；多选、价格、日期需要留一个确认入口 */
const isInstantField = (field: FilterField): boolean => {
  if (field.type === 'tag' || field.type === 'select') return !field.multiple

  // 级联只有叶子可点，选中即终态
  return field.type === 'cascader'
}

/**
 * 选项列表用窄下拉（400rpx），价格 / 日期需要更宽（640rpx），宽度都写在样式里。
 * 级联的窄下拉只是个「壳」——弹层会盖在它上面，所以按窄的处理，别让宽卡片先闪一下。
 */
const isWideDropdown = (field?: FilterField): boolean => field?.type === 'range' || field?.type === 'date'

/** 下拉宽度（rpx）换算成屏幕像素：1rpx = 视口宽 / 750，跟全局根字号是同一套公式 */
const dropdownWidth = (field: FilterField): number =>
  ((isWideDropdown(field) ? 640 : 400) / 750) * window.innerWidth

/** 下拉定位：Vue 3 不会自动给数字补 px，这里统一拼成字符串 */
const dropdownStyle = computed<CSSProperties>(() => ({ left: `${dropdownAnchor.value.left}px` }))

const hasValue = (key: string): boolean => draft[key] !== undefined

/** 触发器文案：有值显示值摘要，没值显示字段名（业务里就是「虚拟商品 ▾」「商品类型 ▾」） */
const triggerText = (field: FilterField): string => {
  const value = draft[field.key]

  if (value === undefined) return field.label

  return formatFilterValue(field, value) || field.label
}

const isTriggerOpen = (field: FilterField): boolean => panelVisible.value && activeKey.value === field.key

/** 面板字段回到已提交值；未确认的修改在收起时丢弃 */
const restorePanelFields = () => {
  for (const field of props.fields) {
    const value = committed.value[field.key]

    if (value === undefined) delete draft[field.key]
    else draft[field.key] = value
  }
}

const closePanel = () => {
  panelVisible.value = false
  activeKey.value = null
  restorePanelFields()
}

/**
 * 自带底部弹层的字段（级联）：点触发器时不再套窄下拉，
 * 直接把控件挂上来由它弹出底部弹层，点一次就能选。
 */
const isPopupField = (field?: FilterField): boolean => field?.type === 'cascader'

const updateField = (key: string, value: FilterValue | undefined) => {
  if (value === undefined) delete draft[key]
  else draft[key] = value

  const snapshot = compactModel(draft)

  // change 永远带最新值：父组件即使没接 v-model，也能据此刷新列表
  emit('change', snapshot, key)

  if (props.autoConfirm) {
    committed.value = snapshot
    emit('update:modelValue', snapshot)

    return
  }

  // 清空已提交的条件立即生效：面板里点了「清除」却还要再点确定、收起面板又悄悄回填，
  // 用户会以为没清掉。只提交这一个 key，别把其它字段未确认的草稿一起带走。
  if (value === undefined && committed.value[key] !== undefined) {
    const next = { ...committed.value }

    delete next[key]
    committed.value = next
    emit('update:modelValue', next)
  }
}

/** 点触发器：展开/收起这个字段专属的下拉 */
const toggleField = (field: FilterField, event: MouseEvent) => {
  if (isTriggerOpen(field)) {
    closePanel()

    return
  }

  const trigger = event.currentTarget as HTMLElement | null
  const bar = trigger?.closest('.wa-mobile-filter-bar__bar')

  if (trigger && bar) {
    const barRect = bar.getBoundingClientRect()
    const triggerRect = trigger.getBoundingClientRect()
    // 下拉一律按「左边界」定位：先贴触发器左边，右半边触发器的宽下拉改成右边对齐，
    // 最后再把左边界夹进筛选条内——不夹的话 640rpx 的宽下拉在右侧触发器上会被屏幕裁掉半截。
    const padding = 6
    const width = Math.min(dropdownWidth(field), Math.max(barRect.width - padding * 2, 0))
    const triggerLeft = triggerRect.left - barRect.left
    const triggerRight = triggerRect.right - barRect.left
    const preferLeft = triggerLeft + triggerRect.width / 2 <= barRect.width / 2
    const rawLeft = preferLeft ? triggerLeft : triggerRight - width
    const maxLeft = Math.max(barRect.width - width - padding, padding)

    dropdownAnchor.value = { left: Math.round(Math.min(Math.max(rawLeft, padding), maxLeft)) }
  }

  restorePanelFields()
  activeKey.value = field.key
  panelVisible.value = true
}

/** 点「筛选」：展开/收起全部字段 */
const toggleAll = () => {
  if (panelVisible.value && activeKey.value === null) {
    closePanel()

    return
  }

  restorePanelFields()
  activeKey.value = null
  panelVisible.value = true
}

const commit = (value: FilterBarModel) => {
  committed.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

const handleConfirm = () => {
  const value = compactModel(draft)

  panelVisible.value = false
  activeKey.value = null
  commit(value)
  emit('confirm', value)
}

/** 字段下拉里的确认只提交当前字段，别把其它面板里未确认的草稿一起带走 */
const handleDropdownConfirm = () => {
  const field = activeField.value

  if (!field) return

  const value = compactModel({ [field.key]: draft[field.key] })
  const next = { ...committed.value, ...value }

  if (value[field.key] === undefined) delete next[field.key]

  panelVisible.value = false
  activeKey.value = null
  committed.value = next
  restorePanelFields()
  emit('update:modelValue', next)
  emit('change', next, field.key)
  emit('confirm', value)
}

const handleReset = () => {
  const value: FilterBarModel = {}

  for (const key of Object.keys(draft)) delete draft[key]
  panelVisible.value = false
  activeKey.value = null
  commit(value)
  emit('reset')
}

const clearField = (key: string) => {
  delete draft[key]

  const value = compactModel(draft)

  committed.value = value
  emit('update:modelValue', value)
  emit('change', value, key)
}

/** 字段下拉：单选点完即提交并收起；多选 / 价格 / 日期留确认入口 */
const handleDropdownUpdate = (field: FilterField, value: FilterValue | undefined) => {
  if (!isInstantField(field)) {
    updateField(field.key, value)

    return
  }

  if (value === undefined) delete draft[field.key]
  else draft[field.key] = value

  const snapshot = compactModel(draft)

  committed.value = snapshot
  emit('update:modelValue', snapshot)
  emit('change', snapshot, field.key)
  panelVisible.value = false
  activeKey.value = null
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  if (!panelVisible.value) return

  const target = event.target as Node | null

  // 日期 / 下拉选择器会 teleport 到 body；点遮罩只让对应 popup 自己关闭，外层 FilterBar 保持展开
  if (target instanceof Element && target.closest('.van-overlay')) return

  const root = triggerRoot.value

  if (target && root?.contains(target)) return
  // 弹层内容仍可继续操作，不能把外层筛选面板关掉
  if (target instanceof Element && target.closest('.van-popup')) return

  closePanel()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
})
</script>

<template>
  <div
    ref="triggerRoot"
    class="wa-mobile-filter-bar"
    :class="{ 'wa-mobile-filter-bar--active': activeCount > 0 }"
  >
    <!-- 触发器行上方的整行插槽：搜索框、店铺切换这类「不属于某个字段」的内容放这里 -->
    <div
      v-if="$slots.top"
      class="wa-mobile-filter-bar__top"
    >
      <slot name="top" />
    </div>

    <div class="wa-mobile-filter-bar__bar">
      <!-- 行内前置插槽：只剩一个筛选字段时，搜索框可以和「筛选」排在同一行 -->
      <div
        v-if="$slots.leading"
        class="wa-mobile-filter-bar__leading"
      >
        <slot name="leading" />
      </div>

      <!-- 筛选条上只放「字段 ▾」触发器，选项留在面板里：手机上横排放不下选项 -->
      <div
        v-if="triggerFields.length > 0"
        class="wa-mobile-filter-bar__triggers"
      >
        <button
          v-for="field in triggerFields"
          :key="field.key"
          type="button"
          class="wa-mobile-filter-bar__trigger-field"
          :class="{ 'is-active': hasValue(field.key) || isTriggerOpen(field) }"
          @click="toggleField(field, $event)"
        >
          <span class="wa-mobile-filter-bar__trigger-text">{{ triggerText(field) }}</span>
          <van-icon :name="isTriggerOpen(field) ? 'arrow-up' : 'arrow-down'" />
        </button>
      </div>

      <!--
        「筛选」只在「当前有筛选条件」时高亮：业务把字段都收进面板时，条上只剩这一个入口，
        靠它提示当前是不是在筛。面板展开本身可见，不再额外染色，避免「没值也亮」的错觉。
      -->
      <button
        v-if="fields.length > 0"
        type="button"
        class="wa-mobile-filter-bar__filter"
        :class="{ 'is-active': activeCount > 0 }"
        @click="toggleAll"
      >
        {{ expandText }}
        <van-icon
          name="filter-o"
          class="wa-mobile-filter-bar__filter-icon"
        />
      </button>
    </div>

    <WaFilterSummary
      v-if="showSummary && summaryChips.length > 0"
      :chips="summaryChips"
      :collapsible="collapsible"
      @close="clearField"
    />

    <!--
      自带弹层的字段（级联）：不套窄下拉，直接挂控件让它的弹层弹出来，
      否则屏幕上会同时出现「筛选下拉壳 + 级联弹层」两层卡片。
    -->
    <component
      v-if="panelVisible && activeField && isPopupField(activeField)"
      :is="getFilterControl(activeField)"
      :field="activeField"
      :model-value="draft[activeField.key]"
      popup-only
      auto-open
      @update:model-value="(value: FilterValue | undefined) => handleDropdownUpdate(activeField!, value)"
      @close="closePanel"
    />

    <!-- 其它字段：窄下拉贴着触发器；点「筛选」是下面的全字段面板 -->
    <Transition name="wa-mobile-filter-bar-drop">
      <div
        v-if="panelVisible && activeField && !isPopupField(activeField)"
        class="wa-mobile-filter-bar__dropdown"
        :class="{ 'wa-mobile-filter-bar__dropdown--wide': isWideDropdown(activeField) }"
        :style="dropdownStyle"
      >
        <div class="wa-mobile-filter-bar__dropdown-title">{{ activeField.label }}</div>
        <div class="wa-mobile-filter-bar__dropdown-body">
          <component
            :is="getFilterControl(activeField)"
            :field="activeField"
            :model-value="draft[activeField.key]"
            :hide-label="true"
            :layout="activeField.type === 'tag' || activeField.type === 'select' ? 'list' : 'grid'"
            @update:model-value="(value: FilterValue | undefined) => handleDropdownUpdate(activeField!, value)"
          />
        </div>
        <div
          v-if="!isInstantField(activeField)"
          class="wa-mobile-filter-bar__dropdown-actions"
        >
          <van-button
            type="primary"
            size="small"
            @click="handleDropdownConfirm"
          >
            {{ confirmText }}
          </van-button>
        </div>
      </div>
    </Transition>

    <Transition name="wa-mobile-filter-bar-drop">
      <div
        v-if="panelVisible && !activeField"
        class="wa-mobile-filter-bar__panel"
      >
        <div class="wa-mobile-filter-bar__panel-body">
          <van-form
            class="wa-mobile-filter-bar__panel-form"
            :model="draft"
          >
            <component
              :is="getFilterControl(field)"
              v-for="field in panelFields"
              :key="field.key"
              :field="field"
              :model-value="draft[field.key]"
              @update:model-value="(value: FilterValue | undefined) => updateField(field.key, value)"
            />
          </van-form>
        </div>
        <div class="wa-mobile-filter-bar__actions">
          <van-button
            v-if="showReset"
            class="wa-mobile-filter-bar__action wa-mobile-filter-bar__action--plain"
            @click="handleReset"
          >
            {{ resetText }}
          </van-button>
          <van-button
            class="wa-mobile-filter-bar__action"
            type="primary"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </van-button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.wa-mobile-filter-bar {
  position: relative;
  background: var(--wa-mobile-background-white, #fff);
}

.wa-mobile-filter-bar__bar {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
}

/* 顶部插槽：左右内边距跟筛选条对齐，底部留白交给 __bar 的 padding */
.wa-mobile-filter-bar__top {
  padding: 24rpx 24rpx 0;
}

/* 行内前置插槽：占满剩余宽度，右侧的「筛选」保持贴边 */
.wa-mobile-filter-bar__leading {
  flex: 1;
  min-width: 0;
}

.wa-mobile-filter-bar__triggers {
  display: flex;
  flex: 1;
  gap: 32rpx;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.wa-mobile-filter-bar__triggers::-webkit-scrollbar {
  display: none;
}

/* 「字段 ▾」：有值或展开中时用主色 */
.wa-mobile-filter-bar__trigger-field {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8rpx;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--wa-mobile-text-color, #323233);
  font-family: inherit;
  font-size: 24rpx;
  cursor: pointer;
  white-space: nowrap;
}

.wa-mobile-filter-bar__trigger-field.is-active,
.wa-mobile-filter-bar__trigger-field.is-active .van-icon {
  color: var(--wa-mobile-color-primary, #1989fa);
}

.wa-mobile-filter-bar__trigger-text {
  overflow: hidden;
  color: inherit;
  text-overflow: ellipsis;
}

.wa-mobile-filter-bar__filter {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8rpx;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--wa-mobile-text-color, #323233);
  font-family: inherit;
  font-size: 24rpx;
  cursor: pointer;
}

.wa-mobile-filter-bar__filter.is-active {
  color: var(--wa-mobile-color-primary, #1989fa);
}

/* 字段下拉：窄卡片贴在触发器下方，点选项即走 */
.wa-mobile-filter-bar__dropdown {
  position: absolute;
  z-index: 35;
  top: calc(100% + 12rpx);
  display: flex;
  flex-direction: column;
  width: 400rpx;
  max-width: calc(100vw - 24rpx);
  max-height: 70vh;
  overflow: hidden;
  border: 2rpx solid var(--wa-mobile-border-color, #ebedf0);
  border-radius: 24rpx;
  background: var(--wa-mobile-background-white, #fff);
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.12);
}

/* 价格 / 日期：两列输入与区间需要更宽的下拉 */
.wa-mobile-filter-bar__dropdown--wide {
  width: 640rpx;
}

.wa-mobile-filter-bar__dropdown-title {
  flex: 0 0 auto;
  padding: 24rpx 28rpx 16rpx;
  color: var(--wa-mobile-text-color, #323233);
  font-size: 28rpx;
  font-weight: 600;
}

.wa-mobile-filter-bar__dropdown-body {
  min-height: 0;
  padding: 0 12rpx 12rpx;
  overflow-y: auto;
  scrollbar-width: none;
}

.wa-mobile-filter-bar__dropdown-body::-webkit-scrollbar {
  display: none;
}

.wa-mobile-filter-bar__dropdown-actions {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  padding: 16rpx 24rpx 24rpx;
  border-top: 2rpx solid var(--wa-mobile-border-color, #ebedf0);
}

.wa-mobile-filter-bar__dropdown-actions .van-button {
  min-width: 144rpx;
  border-radius: var(--wa-mobile-radius-lg, 44rpx);
}

/*
 * 面板：标题固定、字段区滚动、按钮固定在底部；浮在列表上方，靠一层投影和下面的内容分开。
 *
 * 投影必须写成「大 y 偏移 + 负 spread」：这样阴影整体落在面板下方，
 * 顶部不会溢出一圈暗边（面板上面就是白色筛选条，溢出来就是一条脏线）。
 */
.wa-mobile-filter-bar__panel {
  position: absolute;
  z-index: 30;
  top: 100%;
  right: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  max-height: 78vh;
  border-radius: 0 0 32rpx 32rpx;
  background: var(--wa-mobile-background-white, #fff);
  box-shadow: 0 24rpx 48rpx -24rpx rgba(15, 23, 42, 0.28);
}

.wa-mobile-filter-bar-drop-enter-active,
.wa-mobile-filter-bar-drop-leave-active {
  transition: opacity 0.16s ease;
}

.wa-mobile-filter-bar-drop-enter-from,
.wa-mobile-filter-bar-drop-leave-to {
  opacity: 0;
}

.wa-mobile-filter-bar__panel-body {
  flex: 1;
  min-height: 0;
  padding-bottom: 8rpx;
  overflow-y: auto;
  scrollbar-width: none;
}

.wa-mobile-filter-bar__panel-body::-webkit-scrollbar {
  display: none;
}

.wa-mobile-filter-bar__panel-form {
  padding: 8rpx 32rpx 0;
}

.wa-mobile-filter-bar__actions {
  display: flex;
  flex: 0 0 auto;
  gap: 24rpx;
  padding: 24rpx 32rpx calc(32rpx + env(safe-area-inset-bottom, 0rpx));
  border-top: 2rpx solid var(--wa-mobile-border-color, #ebedf0);
}

.wa-mobile-filter-bar__action {
  flex: 1;
  height: 88rpx;
  border-radius: var(--wa-mobile-radius-lg, 44rpx);
  font-size: 32rpx;
}

/* 重置做成浅灰底、深色字：业务里确定才是唯一主按钮 */
.wa-mobile-filter-bar__action--plain {
  border: 0;
  background: var(--wa-mobile-background, #f7f8fa);
  color: var(--wa-mobile-text-color, #323233);
}
</style>
