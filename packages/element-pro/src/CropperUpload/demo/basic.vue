<script setup lang="ts">
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/dist/index.css'
import { CropperUpload } from '@wapri/element-pro'
import type { UploadUserFile } from 'element-plus'

const lastEvent = ref('-')
/** 受控文件列表：裁剪后列表项的 raw 与 url 会被替换成裁剪结果 */
const fileList = ref<UploadUserFile[]>([])

/** 用自定义 httpRequest 模拟上传，便于在文档站演示完整链路 */
const mockUpload = (options: {
  file: File
  onProgress: (evt: ProgressEvent & { percent: number }) => void
  onSuccess: (response: unknown) => void
}) => {
  options.onProgress({ percent: 100 } as ProgressEvent & { percent: number })
  options.onSuccess({ url: URL.createObjectURL(options.file) })
}

const handleCrop = (file: File) => {
  lastEvent.value = `裁剪完成：${file.name}（${(file.size / 1024).toFixed(1)} KB，${file.type}）`
}

const handleCancel = (rawFile: File) => {
  lastEvent.value = `已取消：${rawFile.name}`
}

const handleError = (error: Error) => {
  lastEvent.value = `出错：${error.message}`
}
</script>

<template>
  <div class="cropper-upload-demo">
    <p class="cropper-upload-demo__tip">
      选择图片后会先进入裁剪弹窗，确认后用裁剪结果发起上传。最近事件：{{ lastEvent }}
    </p>

    <div class="cropper-upload-demo__row">
      <CropperUpload
        action="#"
        accept="image/*"
        :http-request="mockUpload"
        @crop="handleCrop"
        @cancel="handleCancel"
        @error="handleError"
      >
        <ElButton
          type="primary"
          plain
        >
          选择图片
        </ElButton>
      </CropperUpload>
    </div>

    <div class="cropper-upload-demo__row">
      <CropperUpload
        v-model:file-list="fileList"
        action="#"
        accept="image/*"
        list-type="picture-card"
        :ratios="[0, 1, 4 / 3, 16 / 9, 9 / 16]"
        aspect-ratio="4/3"
        :http-request="mockUpload"
        @crop="handleCrop"
      >
        <ElButton
          type="primary"
          plain
        >
          卡片列表（可自由比例）
        </ElButton>
      </CropperUpload>
      <p class="cropper-upload-demo__tip">
        受控 file-list：{{ fileList.map((file) => `${file.name}(${file.status})`).join('、') || '暂无' }}
      </p>
    </div>

    <div class="cropper-upload-demo__row">
      <CropperUpload
        action="#"
        accept="image/*"
        list-type="picture-card"
        :ratios="[1]"
        circle
        canvas-height="320px"
        :http-request="mockUpload"
        @crop="handleCrop"
      >
        <ElButton
          type="primary"
          plain
        >
          圆形头像
        </ElButton>
      </CropperUpload>
    </div>

    <div class="cropper-upload-demo__row">
      <CropperUpload
        action="#"
        accept="image/*"
        title="裁剪商城封面"
        :ratios="[9 / 16]"
        :output-width="750"
        confirm-text="确认裁剪并上传"
        :http-request="mockUpload"
        @crop="handleCrop"
      >
        <ElButton plain>9:16 商城封面（固定输出 750 宽）</ElButton>
      </CropperUpload>
    </div>

    <div class="cropper-upload-demo__row">
      <CropperUpload
        action="#"
        accept="image/*"
        :preview="false"
        :ratios="[1, 16 / 9]"
        :http-request="mockUpload"
        @crop="handleCrop"
      >
        <ElButton plain>关闭右侧预览</ElButton>
      </CropperUpload>
    </div>

    <div class="cropper-upload-demo__row">
      <CropperUpload
        action="#"
        accept="image/*"
        :ratios="[1]"
        :cropper-options="{ fixedBox: true }"
        :http-request="mockUpload"
        @crop="handleCrop"
      >
        <ElButton plain>固定裁剪框大小（cropper-options）</ElButton>
      </CropperUpload>
    </div>

    <div class="cropper-upload-demo__row">
      <CropperUpload
        action="#"
        accept="image/*"
        :cropper="false"
        :http-request="mockUpload"
      >
        <ElButton plain>关闭裁剪（等同 ElUpload）</ElButton>
      </CropperUpload>
    </div>
  </div>
</template>

<style scoped>
.cropper-upload-demo__tip {
  margin: 0 0 12px;
  color: #909399;
  font-size: 13px;
}

.cropper-upload-demo__row {
  margin-bottom: 16px;
}
</style>
