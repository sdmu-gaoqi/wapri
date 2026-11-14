<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

const plugins = ['abLoop']
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      播放到想要的起点后，点右下角设置按钮 →「AB 循环」→「设置 A 点」，再往后播一点「设置 B 点」，之后播到 B
      点会自动跳回 A 点。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
