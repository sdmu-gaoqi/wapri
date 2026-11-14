<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

const plugins = ['filter']
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「画面调节」，三根滑杆实时改视频的 filter，最后一行的「恢复默认」可以一键还原。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
