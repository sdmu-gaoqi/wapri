<script setup lang="ts">
import { computed, ref } from 'vue'
import { defaultPlayerPlugins, pluginEntry, VideoPlayer } from '@wapri/gplayer'
import type { PluginInput, VideoPlayerInstance } from '@wapri/gplayer'

const url = 'https://www.w3schools.com/html/mov_bbb.mp4#t=0.1'

const playerRef = ref<VideoPlayerInstance>()

type SceneKey = 'all' | 'filter' | 'mosaic' | 'blur' | 'chromaKey' | 'videoFilter'

interface Scene {
  key: SceneKey
  label: string
  plugins: PluginInput[]
}

/** 每个场景都在默认插件之上改一项，切换时播放器重建、进度自动接上 */
const scenes: Scene[] = [
  { key: 'all', label: '全部默认', plugins: [...defaultPlayerPlugins] },
  {
    key: 'filter',
    label: '画面调节',
    plugins: [
      ...defaultPlayerPlugins,
      pluginEntry('filter', (config) => ({ ...config, brightness: 140, contrast: 120, saturate: 150 })),
    ],
  },
  {
    key: 'mosaic',
    label: '马赛克',
    plugins: [...defaultPlayerPlugins, pluginEntry('mosaic', (config) => ({ ...config, enabled: true, size: 24 }))],
  },
  {
    key: 'blur',
    label: '模糊',
    plugins: [...defaultPlayerPlugins, pluginEntry('blur', (config) => ({ ...config, enabled: true, radius: 8 }))],
  },
  {
    key: 'chromaKey',
    label: '绿幕',
    plugins: [
      ...defaultPlayerPlugins,
      pluginEntry('chromaKey', (config) => ({ ...config, enabled: true, similarity: 0.45 })),
    ],
  },
  {
    key: 'videoFilter',
    label: '视频滤镜',
    plugins: [
      ...defaultPlayerPlugins,
      pluginEntry('videoFilter', (config) => ({ ...config, preset: 'sepia', intensity: 0.8 })),
    ],
  },
]

const current = ref<SceneKey>('all')

const plugins = computed(() => scenes.find((scene) => scene.key === current.value)?.plugins ?? defaultPlayerPlugins)

const buttonStyle = (active: boolean) => ({
  padding: '4px 12px',
  borderRadius: '6px',
  border: `1px solid ${active ? '#ff6b35' : '#d9d9d9'}`,
  background: active ? '#fff2ec' : 'transparent',
  color: active ? '#ff6b35' : 'inherit',
  cursor: 'pointer',
  fontSize: '13px',
  lineHeight: '22px',
})

const capture = () => {
  void playerRef.value?.screenshot('plugin-demo')
}

const toggleWebFullscreen = () => {
  const art = playerRef.value?.player

  if (art) art.fullscreenWeb = !art.fullscreenWeb
}
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <button
        v-for="scene in scenes"
        :key="scene.key"
        type="button"
        :style="buttonStyle(current === scene.key)"
        @click="current = scene.key"
      >
        {{ scene.label }}
      </button>

      <button
        type="button"
        :style="buttonStyle(false)"
        @click="capture"
      >
        截图
      </button>

      <button
        type="button"
        :style="buttonStyle(false)"
        @click="toggleWebFullscreen"
      >
        网页全屏
      </button>
    </div>

    <VideoPlayer
      ref="playerRef"
      :url="url"
      :plugins="plugins"
    />
  </div>
</template>
