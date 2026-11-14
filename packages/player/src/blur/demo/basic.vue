<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「模糊」，打开开关后拖「模糊程度」。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="['blur']"
    />
  </div>
</template>
