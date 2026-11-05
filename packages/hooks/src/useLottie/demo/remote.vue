<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLottie } from '@wapri/ghooks'

/** 远程 json 地址：交给 lottie-web 自己发请求，不需要先 fetch（示例地址，换成自己的 CDN 即可） */
const REMOTE_URL = 'https://cdn.example.com/lottie/loading.json'

const container = ref<HTMLElement>()
const status = ref('远程资源加载中…')

const { instance, play, pause, stop, playSegments, playAnimation, setLoop, getDuration, on } = useLottie(
  container,
  null,
  {
    path: REMOTE_URL,
    loop: true,
    onReady: (item) => {
      status.value = `远程资源加载完成，共 ${item.totalFrames} 帧`
    },
  },
)

// useLottie 在 onMounted 里创建实例，这里注册晚于它，所以能拿到实例
onMounted(() => {
  on('data_failed', () => {
    status.value = '远程资源加载失败：请检查地址是否可访问、以及是否允许跨域'
  })
})

/** 一次播放两段区间 */
const handleSegmentPlay = () => {
  setLoop(true)
  status.value = '区间播放：[0,24] + [24,72]'
  playSegments([
    [0, 24],
    [24, 72],
  ])
}

/** 关闭循环后按顺序异步播放两段，每段结束才进入下一段 */
const handleAsyncPlay = async () => {
  setLoop(false)
  status.value = '第一段开始'
  await playAnimation([[0, 24]], true)
  status.value = '第一段结束'
  await new Promise((resolve) => setTimeout(resolve, 600))
  status.value = '第二段开始'
  await playAnimation([24, 72])
  status.value = '第二段结束'
}
</script>

<template>
  <div class="lottie-remote-demo">
    <div
      ref="container"
      class="lottie-remote-demo__stage"
    ></div>

    <div class="lottie-remote-demo__panel">
      <div class="lottie-remote-demo__actions">
        <button
          type="button"
          @click="play"
        >
          播放
        </button>
        <button
          type="button"
          @click="pause"
        >
          暂停
        </button>
        <button
          type="button"
          @click="stop"
        >
          停止
        </button>
        <button
          type="button"
          @click="handleSegmentPlay"
        >
          帧播放
        </button>
        <button
          type="button"
          @click="handleAsyncPlay"
        >
          异步多段动画
        </button>
      </div>

      <p class="lottie-remote-demo__status">{{ status }}</p>
      <p class="lottie-remote-demo__status">
        {{ instance ? `实例已就绪，总时长 ${getDuration(false).toFixed(2)}s` : '实例加载中…' }}
      </p>
      <p class="lottie-remote-demo__url">{{ REMOTE_URL }}</p>
    </div>
  </div>
</template>

<style scoped>
.lottie-remote-demo {
  display: flex;
  max-width: 760px;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #1f2937;
}

.lottie-remote-demo__stage {
  width: 240px;
  height: 240px;
  flex: 0 0 auto;
  border-radius: 8px;
  background: #f8fafc;
}

.lottie-remote-demo__panel {
  flex: 1;
  min-width: 260px;
}

.lottie-remote-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lottie-remote-demo__actions button {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: inherit;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.lottie-remote-demo__actions button:hover {
  border-color: #f97316;
  color: #ea580c;
}

.lottie-remote-demo__status {
  margin: 14px 0 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.8;
}

.lottie-remote-demo__url {
  margin: 8px 0 0;
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-all;
}
</style>
