<script setup lang="ts">
import { pluginEntry, VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

// 默认 6 档，这里只放出 3 档
const plugins = [pluginEntry('playbackRate', (config) => ({ ...config, rates: [1, 1.5, 2] }))]
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">点右下角设置按钮 →「播放速度」，菜单项右侧显示当前语速。</div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
