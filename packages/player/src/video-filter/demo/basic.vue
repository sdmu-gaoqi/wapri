<script setup lang="ts">
import { VideoPlayer } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「视频滤镜」选预设，下面那根滑杆调强度；同时开「画面调节」也能叠加。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="['videoFilter', 'filter']"
    />
  </div>
</template>
