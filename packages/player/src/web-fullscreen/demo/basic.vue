<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「网页全屏」，播放器铺满视口；再点一次或按 ESC 退出。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="['webFullscreen']"
    />
  </div>
</template>
