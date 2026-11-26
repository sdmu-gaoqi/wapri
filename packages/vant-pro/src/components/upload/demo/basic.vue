<script setup lang="ts">
import Vant from 'vant'
import { getCurrentInstance, ref } from 'vue'
import { WaUpload, type UploadFileItem, type UploadPickResult, type UploadPickHandler } from '@wapri/vant-pro'

import 'vant/lib/index.css'

/** dumi 的每个 demo 是独立 app，Vant 的组件与样式在这里注册 */
getCurrentInstance()?.appContext.app.use(Vant)

const files = ref<UploadFileItem[]>([])
const events = ref<string[]>([])
let seq = 0
/** 模拟上传的计时器，key 是列表项 id */
const timers = new Map<string, ReturnType<typeof setInterval>>()
/** 已经失败过一次的项，重试时让它成功 */
const failedOnce = new Set<string>()

/** 用 canvas 画一张图当本地选中的结果，避免 demo 依赖网络图片 */
const createDemoImage = (text: string, from: string, to: string): string => {
  const canvas = document.createElement('canvas')
  canvas.width = 240
  canvas.height = 240
  const context = canvas.getContext('2d')

  if (context) {
    const gradient = context.createLinearGradient(0, 0, 240, 240)
    gradient.addColorStop(0, from)
    gradient.addColorStop(1, to)
    context.fillStyle = gradient
    context.fillRect(0, 0, 240, 240)
    context.fillStyle = '#fff'
    context.font = 'bold 64px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, 120, 120)
  }

  return canvas.toDataURL('image/png')
}

/** 模拟一次上传：进度从 0 走到 100，最后一项故意失败，方便看重试态 */
const upload = (item: UploadFileItem) => {
  const id = String(item.id)
  const timer = setInterval(() => {
    const current = files.value.find((file) => String(file.id) === id)

    if (!current) {
      clearInterval(timer)
      timers.delete(id)

      return
    }

    current.percent = Math.min((current.percent ?? 0) + 25, 100)

    if (current.percent >= 100) {
      const shouldFail = id === 'demo-2' && !failedOnce.has(id)

      if (shouldFail) failedOnce.add(id)
      current.status = shouldFail ? 'failed' : 'done'
      clearInterval(timer)
      timers.delete(id)
    }
  }, 300)

  timers.set(id, timer)
}

const pick: UploadPickHandler = () => {
  const index = ++seq
  const result: UploadPickResult = {
    id: `demo-${index}`,
    url: createDemoImage(String(index), '#f59e0b', '#ef4444'),
    name: `图片-${index}.png`,
    size: 240 * 1024,
  }

  return Promise.resolve(result)
}

const onPicked = (items: UploadFileItem[]) => {
  items.forEach((item) => {
    item.status = 'uploading'
    item.percent = 0
    upload(item)
  })
  events.value.unshift(`新增 ${items.length} 张`)
}

const onRemove = (_item: UploadFileItem, index: number) => {
  events.value.unshift(`删除第 ${index + 1} 张`)
}

const onRetry = (item: UploadFileItem) => {
  item.status = 'uploading'
  item.percent = 0
  upload(item)
  events.value.unshift(`重试 ${item.name ?? ''}`)
}
</script>

<template>
  <div class="upload-demo">
    <WaUpload
      v-model="files"
      :pick="pick"
      @picked="onPicked"
      @remove="onRemove"
      @retry="onRetry"
      @preview="(item) => events.unshift(`预览 ${item.name ?? ''}`)"
    />

    <ul class="upload-demo__log">
      <li
        v-for="text in events.slice(0, 4)"
        :key="text"
      >
        {{ text }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.upload-demo {
  display: grid;
  gap: 24rpx;
  padding: 24rpx;
  border: 2rpx dashed #e5e7eb;
  border-radius: 16rpx;
  color: #1f2937;
  font-size: 26rpx;
}

.upload-demo__log {
  display: grid;
  gap: 8rpx;
  margin: 0;
  padding-left: 36rpx;
  color: #6b7280;
}
</style>
