<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">这个播放器没有传 plugins，右侧菜单里就是全部默认插件。</div>
    <div style="font-size: 13px; color: #999">马赛克、模糊、绿幕的开关默认关闭，打开后才作用到画面。</div>

    <VideoPlayer :url="url" />
  </div>
</template>
