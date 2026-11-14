<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

const plugins = ['pip']
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「画中画」。开关态会跟着浏览器原生控件一起变；页面切到后台时是否自动进入画中画由 autoEnter
      控制。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
