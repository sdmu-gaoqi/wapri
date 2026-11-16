<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">没传 plugins 时，右侧设置菜单里只有画面调节与网页全屏。</div>
    <div style="font-size: 13px; color: #999">截图、马赛克、模糊、绿幕等需要显式写进 plugins，见页面里的示例。</div>

    <VideoPlayer :url="url" />
  </div>
</template>
