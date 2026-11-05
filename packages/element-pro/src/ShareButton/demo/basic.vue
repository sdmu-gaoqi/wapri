<script setup lang="ts">
import { ref } from 'vue'
import { ElInput } from 'element-plus'
import 'element-plus/dist/index.css'
import { ShareButton } from '@wapri/element-pro'
import { os } from '@wapri/gutils'

const link = ref('demoapp://find/community/detail?postId=10086')
const lastEvent = ref('-')
const inWeixin = os.isWeixin()

const handleShare = (target: string) => {
  lastEvent.value = `share: ${target}`
}

const handleCopy = (target: string) => {
  lastEvent.value = `copy: ${target}`
}
</script>

<template>
  <div class="share-button-demo">
    <p class="share-button-demo__tip">
      当前环境：{{ inWeixin ? '微信内置浏览器（点击后展示引导浮层）' : '非微信（点击后直接跳转 link）' }}
    </p>
    <ElInput
      v-model="link"
      placeholder="分享链接，如 demoapp:// 或 https://"
      class="share-button-demo__input"
    />
    <div class="share-button-demo__actions">
      <ShareButton
        :link="link"
        @share="handleShare"
        @copy="handleCopy"
      />
      <ShareButton
        :link="link"
        type="primary"
        plain
        disabled
      >
        已禁用
      </ShareButton>
      <ShareButton
        :link="link"
        :force-guide="true"
        type="warning"
      >
        预览引导浮层
      </ShareButton>
    </div>
    <p class="share-button-demo__tip">最近事件：{{ lastEvent }}</p>
  </div>
</template>

<style scoped>
.share-button-demo__tip {
  margin: 0 0 8px;
  color: #909399;
  font-size: 13px;
}

.share-button-demo__input {
  max-width: 420px;
}

.share-button-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0;
}
</style>
