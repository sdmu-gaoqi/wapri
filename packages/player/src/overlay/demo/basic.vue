<script setup lang="ts">
import { pluginEntry, VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

const badge =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='48'%3E%3Crect width='160' height='48' rx='10' fill='%23ff6b35'/%3E%3Ctext x='80' y='31' font-family='sans-serif' font-size='18' fill='white' text-anchor='middle'%3Ewapri%3C/text%3E%3C/svg%3E"

const plugins = [pluginEntry('overlay', (config) => ({ ...config, src: badge, width: 30, x: 74, y: 76 }))]
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      右下角设置 →「视频叠加」控制开关、透明度与大小；角标可以直接拖动位置，「重置位置」回到初始点。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
