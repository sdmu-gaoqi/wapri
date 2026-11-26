<script setup lang="ts">
import Vant from 'vant'
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue'
import { WaVH100 } from '@wapri/vant-pro'

import 'vant/lib/index.css'

/** dumi 的每个 demo 是独立 app，Vant 的组件与样式在这里注册 */
getCurrentInstance()?.appContext.app.use(Vant)

/** 容器高度由组件内部算，这里同步一份读数方便对照 */
const viewport = ref(0)
const tick = ref(0)

const syncViewport = () => {
  viewport.value = window.innerHeight
}

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
})
</script>

<template>
  <WaVH100 class="vh100-demo">
    <div class="vh100-demo__content">
      <strong>容器高度 = 视口高度</strong>
      <span>当前视口 {{ viewport }}px</span>
      <span>内容超出一屏时在容器内部滚动</span>
      <button
        type="button"
        @click="tick += 1"
      >
        点一下：{{ tick }}
      </button>
    </div>
  </WaVH100>
</template>

<style scoped>
.vh100-demo {
  background: linear-gradient(180deg, #fffbeb, #fff);
}

.vh100-demo__content {
  display: grid;
  gap: 16rpx;
  align-content: center;
  justify-items: center;
  height: 100%;
  padding: 32rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.vh100-demo__content strong {
  color: #b45309;
  font-size: 28rpx;
}

.vh100-demo__content button {
  padding: 8rpx 28rpx;
  border: 2rpx solid #fcd34d;
  border-radius: 1998rpx;
  background: #fff;
  color: #b45309;
  cursor: pointer;
  font-size: 24rpx;
}
</style>
