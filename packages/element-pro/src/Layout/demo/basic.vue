<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import 'element-plus/dist/index.css'
import { Layout, type SidebarMenuItem, type SidebarProps } from '@wapri/element-pro'
import DemoLink from '../../Sidebar/demo/DemoLink.vue'

const collapse = ref(false)
const activeMenu = ref('/order/list')

const menus: SidebarMenuItem[] = [
  {
    path: '/order',
    meta: { title: '订单管理', icon: 'Tickets' },
    children: [
      { path: 'list', meta: { title: '订单列表' } },
      { path: 'after-sale', meta: { title: '售后工单' } },
      { path: 'refund', meta: { title: '退款管理' } },
      { path: 'delivery', meta: { title: '发货管理' } },
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
  { path: '/dashboard', meta: { title: '数据看板', icon: 'DataLine' } },
]

/** 侧栏配置整体通过 sidebar 属性透传 */
const sidebar = computed<SidebarProps>(() => ({
  menus,
  activeMenu: activeMenu.value,
  collapse: collapse.value,
  mode: 'grouped',
  title: 'wa',
  subtitle: '后台',
  linkComponent: DemoLink,
}))

provide('demoNavigate', (path: string) => {
  activeMenu.value = path
})
</script>

<template>
  <div class="layout-demo">
    <Layout
      :sidebar="sidebar"
      :header="{ fixed: true }"
      has-tags-view
      @toggle-sidebar="collapse = !collapse"
    >
      <template #header>
        <div class="layout-demo__header">
          <span class="layout-demo__tip">当前激活菜单：{{ activeMenu }}</span>
        </div>
      </template>
      <template #main>
        <div class="layout-demo__main">
          <p>
            左上角是 Layout 内置的折叠按钮，点击会抛出 toggleSidebar 事件；header 与 main
            插槽的内容都会跟随侧栏状态自动让位。
          </p>
        </div>
      </template>
    </Layout>
  </div>
</template>

<style scoped>
.layout-demo {
  position: relative;
  height: 420px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  /* 让内部 position: fixed 的侧栏以本容器为参照，避免跑到文档流外 */
  transform: translateZ(0);
}

.layout-demo__header {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  /* 给内置折叠按钮留出左侧间距 */
  padding: 0 16px 0 calc(var(--wa-ui-layout-trigger-width, 50px) + 12px);
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.layout-demo__tip {
  color: #909399;
  font-size: 13px;
}

.layout-demo__main {
  padding: 16px;
  color: #606266;
  font-size: 13px;
}
</style>
