<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { FileUpload } from '@wapri/element-pro'

const status = ref('还没有选择文件')

const handleSelect = (files: File[]): void => {
  status.value = `已选择：${files.map((file) => file.name).join('、')}`
  ElMessage.success(`收到 ${files.length} 个文件，交给业务上传`)
}

const handleReject = (files: File[]): void => {
  ElMessage.warning(`已忽略 ${files.length} 个非图片文件`)
}
</script>

<template>
  <div class="file-upload-demo">
    <p class="file-upload-demo__tip">点击面板或「直接上传」选图，也可以把图片拖进来。当前：{{ status }}</p>
    <FileUpload
      accept="image/*"
      multiple
      @select="handleSelect"
      @reject="handleReject"
    />
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
