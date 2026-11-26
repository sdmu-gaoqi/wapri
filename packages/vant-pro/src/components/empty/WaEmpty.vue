<script setup lang="ts">
import { computed } from 'vue'
import type { EmptyModule, WaEmptyEmits, WaEmptyProps } from './types'

defineOptions({ name: 'WaEmpty' })

const props = withDefaults(defineProps<WaEmptyProps>(), {
  image: 'default',
  description: '',
  module: undefined,
  size: undefined,
  showAction: false,
  actionText: '刷新',
  loading: false,
})
const emit = defineEmits<WaEmptyEmits>()

/**
 * module 只负责给默认值：显式传了 image / description 时以 props 为准，
 * 这样业务既可以用预设快速起页面，也能覆盖其中一个。
 */
const PRESETS: Record<EmptyModule, { image: string; description: string }> = {
  list: { image: 'default', description: '暂无数据' },
  table: { image: 'default', description: '暂无数据' },
  search: { image: 'search', description: '没有找到相关内容' },
  network: { image: 'network', description: '网络异常，请稍后重试' },
  notice: { image: 'default', description: '暂无通知' },
  error: { image: 'error', description: '加载失败，请稍后重试' },
}

const preset = computed(() => (props.module ? PRESETS[props.module] : undefined))
const finalImage = computed(() => (props.image !== 'default' ? props.image : (preset.value?.image ?? 'default')))
const finalDescription = computed(() => props.description || preset.value?.description || '暂无数据')

const handleAction = () => {
  // loading 期间按钮本身已置灰，这里再拦一次，避免重复请求
  if (props.loading) return
  emit('action')
}
</script>

<template>
  <div class="wa-mobile-empty">
    <van-empty
      :image="finalImage"
      :description="finalDescription"
      :image-size="size"
    >
      <slot />
      <van-button
        v-if="showAction"
        class="wa-mobile-empty__action"
        size="small"
        type="primary"
        plain
        :loading="loading"
        @click="handleAction"
      >
        {{ actionText }}
      </van-button>
      <div
        v-if="$slots.footer"
        class="wa-mobile-empty__footer"
      >
        <slot name="footer" />
      </div>
    </van-empty>
  </div>
</template>

<style scoped>
.wa-mobile-empty {
  width: 100%;
}

.wa-mobile-empty__action {
  margin-top: 16rpx;
}

.wa-mobile-empty__footer {
  margin-top: 16rpx;
}
</style>
