<script setup lang="ts">
import { h, provide, ref } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/dist/index.css'
import { Sidebar, type SidebarMenuItem } from '@wapri/element-pro'
import DemoLink from './DemoLink.vue'

const activeMenu = ref('/dashboard')
const collapse = ref(false)

const menus: SidebarMenuItem[] = [
  { path: '/dashboard', meta: { title: '工作台', icon: '📊' } },
  { path: '/order', meta: { title: '订单管理', icon: '📦' } },
  { path: '/goods', meta: { title: '商品管理', icon: '🏷️' } },
]

/** 自定义图标渲染函数：直接用 emoji 渲染 meta.icon */
const renderIcon = (icon: string) => h('span', { class: 'demo-emoji-icon' }, icon)

provide('demoNavigate', (path: string) => {
  activeMenu.value = path
})
</script>

<template>
  <div class="sidebar-demo">
    <Sidebar
      mode="grouped"
      :menus="menus"
      :active-menu="activeMenu"
      :collapse="collapse"
      :render-icon="renderIcon"
      :link-component="DemoLink"
    >
      <template #logo="{ collapse: collapsed }">
        <div class="demo-logo">{{ collapsed ? 'wa' : 'wa 展开' }}</div>
      </template>
    </Sidebar>
    <div class="sidebar-demo__panel">
      <p>当前激活菜单：{{ activeMenu }}</p>
      <ElButton @click="collapse = !collapse">{{ collapse ? '展开侧栏' : '折叠侧栏' }}</ElButton>
      <p>
        通过
        <code>renderIcon</code>
        接管图标渲染，通过
        <code>logo</code>
        插槽完全替换品牌区。
      </p>
    </div>
  </div>
</template>

<style scoped>
.sidebar-demo {
  display: flex;
  height: 420px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.sidebar-demo__panel {
  flex: 1;
  padding: 16px;
  color: #606266;
  font-size: 13px;
}

.sidebar-demo :deep(.demo-emoji-icon) {
  margin-right: 8px;
  font-size: 14px;
  line-height: 1;
}

.sidebar-demo :deep(.demo-logo) {
  height: 56px;
  padding: 0 20px;
  color: #1b242d;
  font-size: 15px;
  font-weight: 700;
  line-height: 56px;
  background: #fff;
}
</style>
