<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { configurePdfjs, previewFile } from '@wapri/preview'
import type { PreviewHandle } from '@wapri/preview'

// 文档站静态资源；业务接入时换成自己部署的 worker 地址
configurePdfjs({ workerSrc: '/pdf.worker.min.mjs' })

const container = ref<HTMLElement>()
const handle = shallowRef<PreviewHandle>()
const error = ref('')
const kind = ref('')
const name = ref('')
const loading = ref(false)
const remoteUrl = ref('/demo/sample.pdf')

const reset = () => {
  handle.value?.destroy()
  handle.value = undefined
  error.value = ''
  kind.value = ''
}

const run = async (task: (target: HTMLElement) => Promise<PreviewHandle>) => {
  const target = container.value

  if (!target) return

  reset()
  loading.value = true

  try {
    const next = await task(target)

    handle.value = next
    kind.value = next.kind
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  } finally {
    loading.value = false
  }
}

const openFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) return

  name.value = file.name
  await run((target) => previewFile(file, { container: target }))
}

const openLongText = async () => {
  name.value = '示例文本（2000 行）'

  const lines = Array.from({ length: 2000 }, (_, index) => `第 ${index + 1} 行：wapri preview 只渲染可视区域`)

  await run((target) => previewFile(new Blob([lines.join('\n')], { type: 'text/plain' }), { container: target }))
}

const openRemote = async () => {
  const url = remoteUrl.value.trim()

  if (!url) return

  name.value = url
  await run((target) => previewFile({ url }, { container: target, pdf: { thumbnails: true } }))
}

onBeforeUnmount(() => handle.value?.destroy())
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
      <input
        type="file"
        accept=".txt,.md,.json,.csv,.pdf,.docx,.xlsx,.xls"
        @change="openFile"
      />
      <button
        :disabled="loading"
        @click="openLongText"
      >
        预览 2000 行文本
      </button>
      <span
        v-if="name"
        style="color: #8f959e; font-size: 13px; overflow-wrap: anywhere"
      >
        {{ name }}
        <template v-if="kind">（{{ kind }}）</template>
      </span>
    </div>

    <div style="display: grid; gap: 6px">
      <span style="color: #8f959e; font-size: 12px">远程地址</span>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start">
        <textarea
          v-model="remoteUrl"
          rows="3"
          spellcheck="false"
          placeholder="https://example.com/files/report.pdf"
          style="
            flex: 1;
            min-width: 240px;
            box-sizing: border-box;
            padding: 8px 10px;
            color: #2a1a0f;
            font:
              12px/1.6 ui-monospace,
              SFMono-Regular,
              Menlo,
              Consolas,
              monospace;
            background: #fff;
            border: 1px solid #e5e6eb;
            border-radius: 6px;
            resize: vertical;
            word-break: break-all;
          "
        />
        <button
          :disabled="loading"
          style="flex: 0 0 auto; min-width: 104px"
          @click="openRemote"
        >
          预览远程文件
        </button>
      </div>
    </div>

    <p
      v-if="error"
      style="margin: 0; color: #d83931; font-size: 13px; overflow-wrap: anywhere"
    >
      {{ error }}
    </p>

    <div
      ref="container"
      style="height: 480px; overflow: hidden; border: 1px solid #e5e6eb; border-radius: 8px"
    />
  </div>
</template>
