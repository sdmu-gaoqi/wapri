<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { ElButton, ElSpace, ElTag } from 'element-plus'
import { NProgress } from '@wapri/element-pro'

const status = ref<number | null>(null)
const requesting = ref(false)

/** `NProgress.status` 是普通 getter，不是响应式数据，这里手动同步到视图。 */
const sync = (): void => {
  status.value = NProgress.status
}

const handleStart = (): void => {
  NProgress.start()
  sync()
}

const handleInc = (): void => {
  NProgress.inc()
  sync()
}

const handleHalf = (): void => {
  NProgress.set(0.5)
  sync()
}

const handleDone = (): void => {
  NProgress.done()
  sync()
}

const handleRequest = (): void => {
  requesting.value = true
  NProgress.start()
  sync()
  setTimeout(() => {
    NProgress.done()
    requesting.value = false
    sync()
  }, 1600)
}

// 离开页面时清掉可能还在走或正在淡出的进度条
onBeforeUnmount(() => {
  NProgress.remove()
})
</script>

<template>
  <div class="nprogress-demo">
    <ElSpace wrap>
      <ElButton
        type="primary"
        @click="handleStart"
      >
        start()
      </ElButton>
      <ElButton @click="handleInc">inc()</ElButton>
      <ElButton @click="handleHalf">set(0.5)</ElButton>
      <ElButton @click="handleDone">done()</ElButton>
      <ElButton
        type="success"
        :loading="requesting"
        @click="handleRequest"
      >
        模拟一次请求
      </ElButton>
    </ElSpace>
    <p class="nprogress-demo__status">
      当前进度：
      <ElTag
        size="small"
        type="info"
      >
        {{ status === null ? '未开始' : status }}
      </ElTag>
    </p>
  </div>
</template>

<style scoped>
.nprogress-demo__status {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
