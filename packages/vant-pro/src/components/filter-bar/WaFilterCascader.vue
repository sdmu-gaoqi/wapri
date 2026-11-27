<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { findCascaderPath } from './useFilterModel'
import type { WaFilterCascaderProps } from './types'

import './styles/index.css'

/**
 * 级联选择（分类树这类父子结构）。
 *
 * 值只存叶子节点的 `value`，按钮文案由 `options` 反查完整路径；
 * 点开是 `van-cascader` 底部弹层，选到叶子即结束并回传值。
 */
defineOptions({ name: 'WaFilterCascader' })

const props = withDefaults(defineProps<WaFilterCascaderProps>(), {
  modelValue: undefined,
  inline: false,
  hideLabel: false,
  popupOnly: false,
  autoOpen: false,
  resetText: '重置',
})
const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
  /** 没选就退出（点关闭 / 点遮罩），父级据此收起外层筛选面板 */
  close: []
}>()

/** van-cascader 默认读 text/value/children，这里把它指到我们的 label 上，省掉一次深层拷贝 */
const FIELD_NAMES = { text: 'label', value: 'value', children: 'children' }

const popupVisible = ref(false)
/** 弹层里的临时选中值：确认（选到叶子）才写回 modelValue */
const pickerValue = ref('')

const hasOptions = computed(() => props.field.options.length > 0)

const pathText = computed(() =>
  findCascaderPath(props.field.options, props.modelValue)
    .map((option) => option.label)
    .join(props.field.separator ?? ' / '),
)

const openPopup = () => {
  if (!hasOptions.value) return

  pickerValue.value = props.modelValue ?? ''
  popupVisible.value = true
}

const handleFinish = (payload: { value?: unknown }) => {
  popupVisible.value = false

  const value = payload.value

  emit('update:modelValue', value === undefined || value === null || value === '' ? undefined : String(value))
}

const dismiss = () => {
  popupVisible.value = false
  emit('close')
}

/**
 * 清空已选分类。
 *
 * 级联只能一层层往下点，没有「取消选中」的位置，必须给一个显式的重置入口：
 * 抛 undefined 让筛选条把 key 从 model 里删掉，等价的「全部分类」。
 */
const resetValue = () => {
  popupVisible.value = false
  emit('update:modelValue', undefined)
}

onMounted(() => {
  // 由筛选条挂上来时（popupOnly + autoOpen）直接弹层，点一次触发器就能选分类
  if (props.autoOpen) openPopup()
})
</script>

<template>
  <div class="wa-mobile-filter-bar__cascader">
    <!-- popupOnly：由筛选条挂载，只负责弹层，屏幕上不要再出现一张「值 ›」卡片 -->
    <div
      v-if="!popupOnly"
      class="wa-mobile-filter-bar__field"
    >
      <div
        v-if="!inline && !hideLabel"
        class="wa-mobile-filter-bar__label"
      >
        {{ field.label }}
      </div>

      <button
        type="button"
        class="wa-mobile-filter-bar__cell wa-mobile-filter-bar__cell--cascader"
        @click="openPopup"
      >
        <span
          class="wa-mobile-filter-bar__cascader-text"
          :class="{ 'wa-mobile-filter-bar__cell--placeholder': !pathText }"
        >
          {{ pathText || field.placeholder || '请选择' }}
        </span>
        <van-icon
          name="arrow"
          class="wa-mobile-filter-bar__cascader-arrow"
        />
      </button>
    </div>

    <van-popup
      v-model:show="popupVisible"
      class="wa-mobile-filter-bar__cascader-popup"
      position="bottom"
      round
      teleport="body"
      @click-overlay="dismiss"
    >
      <van-cascader
        v-model="pickerValue"
        :title="field.label"
        :options="field.options"
        :field-names="FIELD_NAMES"
        @finish="handleFinish"
        @close="dismiss"
      />

      <!-- 级联没有「取消选中」的位置，底部给一个显式重置：清空后回到「全部分类」 -->
      <div class="wa-mobile-filter-bar__cascader-actions">
        <van-button
          class="wa-mobile-filter-bar__cascader-reset"
          block
          :disabled="!modelValue"
          @click="resetValue"
        >
          {{ resetText }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.wa-mobile-filter-bar__cascader {
  width: 100%;
}

/* 格子：左文右箭头（公共样式里的格子是居中的） */
.wa-mobile-filter-bar__cell--cascader {
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
}

.wa-mobile-filter-bar__cascader-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wa-mobile-filter-bar__cascader-arrow {
  flex: 0 0 auto;
  margin-left: 16rpx;
  color: var(--wa-mobile-text-color-weak, #969799);
  font-size: 28rpx;
}

/* 分类层级多时选项列表容易顶到状态栏，给弹层兜一层安全区 */
.wa-mobile-filter-bar__cascader-popup {
  padding-bottom: env(safe-area-inset-bottom, 0rpx);
}

/* 底部重置：浅灰底的次按钮，跟筛选面板里的「重置」同一套观感 */
.wa-mobile-filter-bar__cascader-actions {
  padding: 8rpx 32rpx 24rpx;
}

.wa-mobile-filter-bar__cascader-reset.van-button {
  height: 80rpx;
  border: 0;
  border-radius: var(--wa-mobile-radius-lg, 44rpx);
  background: var(--wa-mobile-background, #f7f8fa);
  color: var(--wa-mobile-text-color, #323233);
  font-family: inherit;
  font-size: 30rpx;
}

.wa-mobile-filter-bar__cascader-reset.van-button.is-disabled {
  color: var(--wa-mobile-text-color-weak, #969799);
  opacity: 0.6;
}
</style>
