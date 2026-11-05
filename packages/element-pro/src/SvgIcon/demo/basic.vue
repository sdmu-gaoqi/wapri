<script setup lang="ts">
import { ElMessage, ElTooltip } from 'element-plus'
import 'element-plus/dist/index.css'
import { copy } from '@wapri/gutils'
import { SvgIcon } from '@wapri/element-pro'

interface IconExample {
  name: string
  color?: string | string[]
}

const icons: IconExample[] = [
  { name: 'star' },
  { name: 'heart', color: '#f56c6c' },
  { name: 'home', color: ['#409eff', '#67c23a'] },
  { name: 'search' },
  { name: 'check' },
  { name: 'close' },
]

/** 示例用的 symbol 集合，真实项目由图标集脚本或宿主页面提供 */
const SYMBOL_CONTAINER_ID = 'svg-icon-demo-symbols'
const SYMBOLS = `
<svg id="${SYMBOL_CONTAINER_ID}" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">
  <symbol id="icon-star" viewBox="0 0 24 24"><path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z"/></symbol>
  <symbol id="icon-heart" viewBox="0 0 24 24"><path d="M12 20.8s-7.3-4.5-9-8.7A5.3 5.3 0 0 1 12 6.6a5.3 5.3 0 0 1 9 5.5c-1.7 4.2-9 8.7-9 8.7z"/></symbol>
  <symbol id="icon-home" viewBox="0 0 24 24"><path d="M4 10.6 12 4l8 6.6V20h-5.2v-5H9.2v5H4z"/></symbol>
  <symbol id="icon-search" viewBox="0 0 24 24"><path d="M10.8 3.4a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8zm0 2a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8z"/><path d="M15.9 15.9l4.6 4.6-1.4 1.4-4.6-4.6z"/></symbol>
  <symbol id="icon-check" viewBox="0 0 24 24"><path d="M9.6 17.2 4.4 12l1.5-1.5 3.7 3.7 8.5-8.5L19.6 7z"/></symbol>
  <symbol id="icon-close" viewBox="0 0 24 24"><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6L17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z"/></symbol>
</svg>`

if (typeof document !== 'undefined' && !document.getElementById(SYMBOL_CONTAINER_ID)) {
  document.body.insertAdjacentHTML('afterbegin', SYMBOLS)
}

function getIconCode({ name, color }: IconExample): string {
  if (Array.isArray(color)) return `<SvgIcon name="${name}" :size="24" :color="${JSON.stringify(color)}" />`
  if (color) return `<SvgIcon name="${name}" :size="24" color="${color}" />`
  return `<SvgIcon name="${name}" :size="24" />`
}

function copyIconCode(icon: IconExample): void {
  const code = getIconCode(icon)
  if (copy(code)) {
    ElMessage.success(`已复制 ${code}`)
    return
  }
  ElMessage.error('复制失败，请手动复制代码')
}
</script>

<template>
  <div class="svg-icon-demo">
    <ElTooltip
      v-for="icon in icons"
      :key="icon.name"
      :content="`点击复制 ${getIconCode(icon)}`"
      placement="top"
    >
      <button
        type="button"
        class="svg-icon-demo__item"
        :aria-label="`复制 ${icon.name} 图标代码`"
        @click="copyIconCode(icon)"
      >
        <SvgIcon
          :name="icon.name"
          :size="24"
          :color="icon.color"
          aria-hidden="true"
        />
        <span>{{ icon.name }}</span>
      </button>
    </ElTooltip>
  </div>
</template>

<style scoped>
.svg-icon-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.svg-icon-demo__item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 104px;
  gap: 8px;
  padding: 12px;
  color: var(--el-text-color-regular);
  font: inherit;
  cursor: pointer;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  transition:
    color var(--el-transition-duration),
    border-color var(--el-transition-duration),
    background-color var(--el-transition-duration);
}

.svg-icon-demo__item:hover,
.svg-icon-demo__item:focus-visible {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
  outline: none;
}

.svg-icon-demo__item span {
  max-width: 120px;
  font-size: 12px;
  overflow-wrap: anywhere;
}
</style>
