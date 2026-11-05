<script setup lang="ts">
import { ref, provide } from 'vue'
import 'element-plus/dist/index.css'
import { Sidebar, type SidebarMenuItem } from '@wapri/element-pro'
import DemoLink from './DemoLink.vue'

const activeMenu = ref('/dashboard')

const menus: SidebarMenuItem[] = [
  { path: '/dashboard', meta: { title: '工作台', icon: 'HomeFilled' } },
  {
    path: '/order',
    meta: { title: '订单管理', icon: 'Tickets' },
    children: [
      { path: 'list', meta: { title: '订单列表' } },
      { path: 'after-sale', meta: { title: '售后工单' } },
    ],
  },
  {
    path: '/goods',
    meta: { title: '商品管理', icon: 'Goods' },
    children: [
      { path: 'list', meta: { title: '商品列表' } },
      { path: 'publish', meta: { title: '发布商品' } },
    ],
  },
  {
    path: 'https://element-plus.org',
    meta: { title: 'Element Plus 官网', icon: 'Link' },
  },
]

provide('demoNavigate', (path: string) => {
  activeMenu.value = path
})
</script>

<template>
  <div class="sidebar-demo">
    <Sidebar
      :menus="menus"
      :active-menu="activeMenu"
      title="wa"
      subtitle="后台"
      :link-component="DemoLink"
    />
    <div class="sidebar-demo__panel">
      <p>当前激活菜单：{{ activeMenu }}</p>
      <p>经典 el-menu 树形导航，支持多级子菜单与外部链接。</p>
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
</style>
