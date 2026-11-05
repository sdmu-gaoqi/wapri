<script setup lang="ts">
import { provide, ref } from 'vue'
import { ElButton } from 'element-plus'
import 'element-plus/dist/index.css'
import { MainContent, Sidebar, type SidebarMenuItem } from '@wapri/element-pro'
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

provide('demoNavigate', (path: string) => {
  activeMenu.value = path
})
</script>

<template>
  <div class="container-demo">
    <Sidebar
      mode="grouped"
      :menus="menus"
      :active-menu="activeMenu"
      :collapse="collapse"
      title="wa"
      subtitle="后台"
      :link-component="DemoLink"
    />
    <MainContent
      mode="grouped"
      :collapse="collapse"
      has-tags-view
    >
      <div class="container-demo__header">
        <ElButton @click="collapse = !collapse">{{ collapse ? '展开侧栏' : '折叠侧栏' }}</ElButton>
        <span class="container-demo__tip">当前激活菜单：{{ activeMenu }}</span>
      </div>
      <div class="container-demo__body">
        <p>主内容区会跟随侧栏的展开 / 折叠自动让位，两侧宽度取自同一套 CSS 变量。</p>
      </div>
    </MainContent>
  </div>
</template>

<style scoped>
.container-demo {
  position: relative;
  height: 420px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.container-demo :deep(.wa-ui-sidebar) {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
}

.container-demo :deep(.wa-ui-main-content) {
  height: 100%;
  overflow: auto;
  background: #f5f7fa;
}

.container-demo__header {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.container-demo__tip {
  color: #909399;
  font-size: 13px;
}

.container-demo__body {
  padding: 16px;
  color: #606266;
  font-size: 13px;
}
</style>
