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

const reset = () => {
  handle.value?.destroy()
  handle.value = undefined
  error.value = ''
  kind.value = ''
}

const openFile = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file || !container.value) return

  reset()
  name.value = file.name

  try {
    handle.value = await previewFile(file, { container: container.value })
    kind.value = handle.value.kind
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  }
}

const openLongText = async () => {
  if (!container.value) return

  reset()
  name.value = '示例文本'

  const lines = Array.from({ length: 2000 }, (_, index) => `第 ${index + 1} 行：wapri preview 只渲染可视区域`)

  handle.value = await previewFile(new Blob([lines.join('\n')], { type: 'text/plain' }), {
    container: container.value,
  })
  kind.value = handle.value.kind
}

const remoteUrl = ref('/demo/sample.pdf')

const openRemote = async () => {
  if (!container.value || !remoteUrl.value) return

  reset()
  name.value = remoteUrl.value

  try {
    handle.value = await previewFile({ url: remoteUrl.value }, {
      container: container.value,
      pdf: { thumbnails: true },
    })
    kind.value = handle.value.kind
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : String(reason)
  }
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
      <button @click="openLongText">预览 2000 行文本</button>
      <span
        v-if="name"
        style="color: #8f959e; font-size: 13px"
      >
        {{ name }}
        <template v-if="kind">（{{ kind }}）</template>
      </span>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center">
      <input
        v-model="remoteUrl"
        placeholder="远程文件地址，例如 /demo/sample.pdf"
        style="flex: 1; min-width: 260px; padding: 4px 8px"
        @keyup.enter="openRemote"
      />
      <button @click="openRemote">预览远程文件</button>
    </div>
    <p
      v-if="error"
      style="margin: 0; color: #d83931; font-size: 13px"
    >
      {{ error }}
    </p>
    <div
      ref="container"
      style="height: 480px; overflow: hidden; border: 1px solid #e5e6eb; border-radius: 8px"
    />
  </div>
</template>
