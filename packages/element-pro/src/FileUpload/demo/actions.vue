<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElDialog, ElMessage } from 'element-plus'
import { FileUpload } from '@wapri/element-pro'

const status = ref('还没有选择文件')
const libraryVisible = ref(false)

const handleSelect = (files: File[]): void => {
  status.value = `直接上传：${files.map((file) => file.name).join('、')}`
}

const handleReject = (files: File[]): void => {
  ElMessage.warning(`已忽略 ${files.length} 个非图片文件`)
}
</script>

<template>
  <div class="file-upload-demo">
    <p class="file-upload-demo__tip">
      关掉自带的按钮，用
      <code>actions</code>
      插槽摆自己的按钮；「打开素材库」交给业务接素材库弹窗。当前：{{ status }}
    </p>
    <FileUpload
      accept="image/*"
      multiple
      :show-upload-button="false"
      @select="handleSelect"
      @reject="handleReject"
    >
      <template #actions="{ open }">
        <ElButton
          type="primary"
          size="small"
          @click="open"
        >
          直接上传
        </ElButton>
        <ElButton
          size="small"
          @click="libraryVisible = true"
        >
          打开素材库
        </ElButton>
      </template>
    </FileUpload>

    <ElDialog
      v-model="libraryVisible"
      title="素材库"
      width="420px"
    >
      业务自己的素材库弹窗（例如 FileModal），选完素材回写到列表里即可。
    </ElDialog>
  </div>
</template>

<style scoped>
.file-upload-demo {
  max-width: 320px;
}

.file-upload-demo__tip {
  margin: 0 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
