<script setup lang="ts">
import { ref } from 'vue'
import { useLottie } from '@wapri/ghooks'
import animationData from './包邮.json'

const container = ref<HTMLElement>()
const status = ref('等待加载')

const { instance, play, pause, stop, playSegments, playAnimation, setLoop, getDuration } = useLottie(
  container,
  animationData,
  {
    loop: true,
    onReady: (item) => {
      status.value = `加载完成，共 ${item.totalFrames} 帧`
    },
  },
)

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
  <div class="lottie-demo">
    <div
      ref="container"
      class="lottie-demo__stage"
    />

    <div class="lottie-demo__panel">
      <div class="lottie-demo__actions">
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

      <p class="lottie-demo__status">{{ status }}</p>
      <p class="lottie-demo__status">
        {{ instance ? `实例已就绪，总时长 ${getDuration(false).toFixed(2)}s` : '实例加载中…' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.lottie-demo {
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

.lottie-demo__stage {
  width: 240px;
  height: 240px;
  flex: 0 0 auto;
  border-radius: 8px;
  background: #f8fafc;
}

.lottie-demo__panel {
  flex: 1;
  min-width: 260px;
}

.lottie-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.lottie-demo__actions button {
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

.lottie-demo__actions button:hover {
  border-color: #f97316;
  color: #ea580c;
}

.lottie-demo__status {
  margin: 14px 0 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.8;
}
</style>
