<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

const plugins = ['flip']
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">点右下角设置按钮 →「画面翻转」，可选正常 / 水平 / 垂直。</div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
