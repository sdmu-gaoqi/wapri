<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElConfigProvider } from 'element-plus'
import type { UploadUserFile } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { CropperUpload } from '@wapri/element-pro'

/** 顺序即语义：商品图集的第一张就是主图，拖完直接看下面的顺序。 */
const fileList = ref<UploadUserFile[]>([])

const order = computed(() => fileList.value.map((file) => file.name).join(' → ') || '（还没有文件）')
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <CropperUpload
      v-model:file-list="fileList"
      :cropper="false"
      sortable
      multiple
      list-type="picture-card"
      accept="image/*"
      :auto-upload="false"
    >
      <template #tip>
        <p style="margin: 8px 0 0; color: var(--el-text-color-secondary)">选中图片后可拖动调整顺序：{{ order }}</p>
      </template>
    </CropperUpload>
  </ElConfigProvider>
</template>
