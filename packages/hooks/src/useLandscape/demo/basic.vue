<template>
  <div>
    <p>
      当前屏幕方向：
      <strong>{{ isLandscape ? '横屏' : '竖屏' }}</strong>
    </p>
    <p>当前视口尺寸：{{ width }} × {{ height }}</p>
    <p style="color: #999">调整窗口宽度（宽>高即为横屏）可实时观察状态变化</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useLandscape } from '@wapri/ghooks'

const isLandscape = useLandscape()
const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

const updateSize = () => {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

window.addEventListener('resize', updateSize)
onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})
</script>
