<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「背景模糊」，打开开关后拖「背景模糊」；再配合「横屏转竖屏」看竖屏容器里的效果。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="['backgroundBlur', 'vertical']"
    />
  </div>
</template>
