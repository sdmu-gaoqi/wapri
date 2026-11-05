<template>
  <div>
    <p>
      当前屏幕方向：
      <strong>{{ isLandscape ? '横屏' : '竖屏' }}</strong>
    </p>
    <p style="color: #999">将窗口拉宽至横屏（宽>高），页面立即被遮罩覆盖并提示旋转屏幕；恢复竖屏后遮罩自动消失</p>
    <div class="content-box">业务内容区域（仅在竖屏时可见）</div>
  </div>
</template>

<script setup lang="ts">
import { useLandscape } from '@wapri/ghooks'
import { os } from '@wapri/gbase'

const isLandscape = useLandscape({
  lock: !os.isIpad() && !os.isPC(),
  tip: '请旋转您的屏幕,切换至竖屏模式',
})
</script>

<style scoped>
.content-box {
  padding: 24px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #666;
}
</style>
