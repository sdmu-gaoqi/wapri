<script setup lang="ts">
import { ref } from 'vue'
import { CreateWorker } from '@wapri/gutils'
import { forEachWorker } from './foreach.worker'

const result = ref('')

const getFileId = (num: number) => {
  const worker = new CreateWorker(forEachWorker)
  return new Promise((resolve) => {
    worker.postMessage(num)
    worker.onmessage = (event: { data: number }) => {
      resolve(event.data)
    }
  })
}

const calculate = async () => {
  result.value = '执行中...'
  const res = await getFileId(10000000000)
  result.value = String(res)
}
</script>

<template>
  <div>执行结果: {{ result }}</div>
  <button @click="calculate">执行一段很复杂的计算</button>
  <br />
</template>

<style scoped></style>
