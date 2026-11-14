<script setup lang="ts">
import { pluginEntry, VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

// 默认四档比例，这里把 21:9 换成 1:1
const plugins = [pluginEntry('aspectRatio', (config) => ({ ...config, ratios: ['default', '16:9', '4:3', '1:1'] }))]
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">点右下角设置按钮 →「画面比例」，default 表示跟随视频原始比例。</div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
