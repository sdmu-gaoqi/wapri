<script setup lang="ts">
import { ref, provide } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/dist/index.css'
import { Sidebar, type SidebarMenuItem } from '@wapri/element-pro'
import DemoLink from './DemoLink.vue'

const activeMenu = ref('/order/list')
const collapse = ref(false)

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
      { path: 'category', meta: { title: '类目管理' } },
    ],
  },
  { path: '/dashboard', meta: { title: '数据看板', icon: 'DataLine' } },
]

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
      title="wa"
      subtitle="后台"
      :link-component="DemoLink"
    />
    <div class="sidebar-demo__panel">
      <p>当前激活菜单：{{ activeMenu }}</p>
      <ElButton @click="collapse = !collapse">{{ collapse ? '展开侧栏' : '折叠侧栏' }}</ElButton>
      <p>双列分组导航：一级菜单为分组标题，二级菜单以两列网格展示；折叠后分组收成图标，悬浮弹出二级菜单。</p>
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
