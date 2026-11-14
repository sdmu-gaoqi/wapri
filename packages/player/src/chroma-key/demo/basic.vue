<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「绿幕」，先「吸取背景色」再点画面里的背景，然后调「相似度」与「边缘羽化」。片源换成绿幕素材效果才正确。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="['chromaKey']"
    />
  </div>
</template>
