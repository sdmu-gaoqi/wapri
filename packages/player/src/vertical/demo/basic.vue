<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「横屏转竖屏」，打开开关后容器切成 9:16；再在「适配方式」里切裁切、完整显示与旋转。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="['vertical', 'backgroundBlur']"
    />
  </div>
</template>
