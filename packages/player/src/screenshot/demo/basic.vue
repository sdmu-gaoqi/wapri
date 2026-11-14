<script setup lang="ts">
import { computed, ref } from 'vue'
import { pluginEntry, VideoPlayer } from '@wapri/gplayer'

/**
 * 截图要把视频帧画进 canvas，跨域视频必须带 CORS 头，否则画布被污染、toDataURL 会报错。
 * mov_bbb.mp4 没有 CORS 头，所以这个 demo 换成允许跨域的 CC0 源。
 */
const url = 'https://cdn.jsdelivr.net/gh/mediaelement/mediaelement-files@master/big_buck_bunny.mp4'

/** 最近一次截图，用来自定义保存逻辑 */
const shot = ref('')

const plugins = computed(() => [
  pluginEntry('screenshot', (config) => ({
    ...config,
    filename: 'wapri-demo',
    // 关掉自动下载，改由 onCapture 自己处理
    download: false,
    onCapture: (result) => {
      shot.value = result.dataUrl
    },
  })),
])
</script>

<template>
  <div style="display: grid; gap: 10px">
    <div style="font-size: 13px; color: #999">
      点右下角设置按钮 →「截图」。这里把 download 关掉，截图结果回填到下方预览。
    </div>

    <VideoPlayer
      :url="url"
      :plugins="plugins"
    />

    <img
      v-if="shot"
      :src="shot"
      alt="截图结果"
      style="width: 100%; border: 1px solid #eee; border-radius: 6px"
    />
    <div
      v-else
      style="font-size: 13px; color: #bbb"
    >
      还没有截图
    </div>
  </div>
</template>
