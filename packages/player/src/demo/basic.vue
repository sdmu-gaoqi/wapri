<script setup lang="ts">
import { ref } from 'vue'
import { VideoPlayer } from '@wapri/gplayer'
import type { VideoPlayerInstance } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'
const playerRef = ref<VideoPlayerInstance>()
const event = ref('等待播放')

const onEvent = (name: string) => {
  event.value = name
}
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
      <button
        type="button"
        @click="playerRef?.toggle()"
      >
        播放 / 暂停
      </button>
      <button
        type="button"
        @click="playerRef?.seek(3)"
      >
        跳到第 3 秒
      </button>
      <button
        type="button"
        @click="playerRef?.screenshot(`demo_${Date.now()}`)"
      >
        截图
      </button>
      <button
        type="button"
        @click="playerRef?.fullscreen()"
      >
        全屏
      </button>
      <span style="color: #666; font-size: 13px">最近事件：{{ event }}</span>
    </div>

    <VideoPlayer
      ref="playerRef"
      :url="url"
      theme="#ff6b35"
      :volume="0.8"
      :options="{ fullscreenWeb: true }"
      @ready="onEvent('ready')"
      @play="onEvent('play')"
      @pause="onEvent('pause')"
      @ended="onEvent('ended')"
      @ratechange="onEvent('ratechange')"
      @fullscreen="onEvent('fullscreen')"
    />
  </div>
</template>
