<script setup lang="ts">
import Vant from 'vant'
import { getCurrentInstance, ref } from 'vue'
import { WaEmpty, type EmptyModule } from '@wapri/vant-pro'

import 'vant/lib/index.css'

/** dumi 的每个 demo 是独立 app，Vant 的组件与样式在这里注册 */
getCurrentInstance()?.appContext.app.use(Vant)

const MODULES: EmptyModule[] = ['list', 'search', 'network', 'notice', 'error']

const module = ref<EmptyModule>('list')
const loading = ref(false)
const count = ref(0)

/** 模拟一次刷新请求：loading 期间按钮不 emit */
const reload = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    count.value += 1
  }, 800)
}
</script>

<template>
  <div class="empty-demo">
    <div class="empty-demo__switch">
      <button
        v-for="item in MODULES"
        :key="item"
        type="button"
        :class="{ 'is-active': item === module }"
        @click="module = item"
      >
        {{ item }}
      </button>
    </div>

    <WaEmpty
      :module="module"
      show-action
      action-text="重新加载"
      :loading="loading"
      @action="reload"
    >
      <p class="empty-demo__tip">点「重新加载」模拟请求，已完成 {{ count }} 次</p>
    </WaEmpty>
  </div>
</template>

<style scoped>
.empty-demo {
  display: grid;
  gap: 24rpx;
  color: #1f2937;
  font-size: 26rpx;
}

.empty-demo__switch {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.empty-demo__switch button {
  padding: 8rpx 24rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 1998rpx;
  background: #fff;
  color: #4b5563;
  cursor: pointer;
  font-size: 24rpx;
}

.empty-demo__switch button.is-active {
  border-color: #f59e0b;
  background: #fffbeb;
  color: #b45309;
}

.empty-demo__tip {
  margin: 8rpx 0 0;
  color: #9ca3af;
  font-size: 24rpx;
}
</style>
