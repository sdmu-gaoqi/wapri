<script setup lang="ts">
import { ref } from 'vue'
import { storage } from '@wapri/gutils'

const key = ref('demo-key')
const value = ref('demo-value')
const result = ref<string | null>(null)
const message = ref('等待操作')

const getKey = () => key.value.trim()

const save = () => {
  const storageKey = getKey()
  if (!storageKey) {
    message.value = '请输入 key 后再存储'
    return
  }

  storage.setItem(storageKey, value.value)
  message.value = '已存储'
}

const read = () => {
  const storageKey = getKey()
  if (!storageKey) {
    message.value = '请输入 key 后再读取'
    result.value = null
    return
  }

  result.value = storage.getItem(storageKey)
  message.value = result.value === null ? '未找到对应数据' : '读取成功'
}
</script>

<template>
  <div class="storage-demo">
    <label class="storage-demo__field">
      <span>Key</span>
      <input
        v-model="key"
        placeholder="请输入 key"
      />
    </label>

    <label class="storage-demo__field">
      <span>Value</span>
      <input
        v-model="value"
        placeholder="请输入 value"
      />
    </label>

    <div class="storage-demo__actions">
      <button
        type="button"
        @click="save"
      >
        存储
      </button>
      <button
        type="button"
        @click="read"
      >
        读取
      </button>
    </div>

    <div
      class="storage-demo__result"
      aria-live="polite"
    >
      <span>{{ message }}</span>
      <code>读取结果：{{ result ?? 'null' }}</code>
    </div>
  </div>
</template>

<style scoped>
.storage-demo {
  display: grid;
  max-width: 640px;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #1f2937;
}

.storage-demo__field {
  display: grid;
  gap: 6px;
  font-size: 14px;
}

.storage-demo__field input {
  box-sizing: border-box;
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  color: inherit;
  font: inherit;
}

.storage-demo__actions {
  display: flex;
  gap: 10px;
}

.storage-demo__actions button {
  height: 34px;
  padding: 0 16px;
  border: 0;
  border-radius: 4px;
  background: #1677ff;
  color: #fff;
  cursor: pointer;
}

.storage-demo__actions button + button {
  background: #4b5563;
}

.storage-demo__result {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 14px;
}

.storage-demo__result code {
  color: #1677ff;
}
</style>
