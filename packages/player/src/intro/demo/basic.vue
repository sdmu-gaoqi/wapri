<script setup lang="ts">
import { pluginEntry, VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

const plugins = [pluginEntry('intro', (config) => ({ ...config, text: 'wapri 放映室', duration: 1800 }))]
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点播放看开场动画，播放结束后可以点右下角设置 →「重播开场」再看一遍。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
