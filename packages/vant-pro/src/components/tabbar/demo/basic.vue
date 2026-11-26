<script setup lang="ts">
import Vant from 'vant'
import { getCurrentInstance, ref } from 'vue'
import { WaTabbar, type TabbarItem } from '@wapri/vant-pro'

import 'vant/lib/index.css'

/** dumi 的每个 demo 是独立 app，Vant 的组件与样式在这里注册 */
getCurrentInstance()?.appContext.app.use(Vant)

const activeKey = ref('home')
const current = ref('首页')

const items: TabbarItem[] = [
  { key: 'home', title: '首页', icon: 'home-o', activeIcon: 'wap-home-o' },
  { key: 'order', title: '订单', icon: 'orders-o', badge: 3 },
  { key: 'cart', title: '购物车', icon: 'shopping-cart-o', dot: true },
  { key: 'mine', title: '我的', icon: 'user-o', activeIcon: 'manager-o' },
]

const onChange = (item: TabbarItem) => {
  current.value = item.title
}
</script>

<template>
  <div class="tabbar-demo">
    <p class="tabbar-demo__tip">当前选中：{{ activeKey }} · {{ current }}</p>
    <div class="tabbar-demo__body">页面内容</div>

    <!-- 默认 fixed：在手机预览里固定在屏幕底部 -->
    <WaTabbar
      v-model="activeKey"
      :items="items"
      @change="onChange"
    />
  </div>
</template>

<style scoped>
.tabbar-demo {
  display: grid;
  gap: 16rpx;
  min-height: 100%;
  color: #1f2937;
  font-size: 24rpx;
}

.tabbar-demo__tip {
  margin: 0;
  padding: 24rpx 24rpx 0;
  color: #6b7280;
}

.tabbar-demo__body {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 320rpx;
  margin: 0 24rpx;
  border: 2rpx dashed #e5e7eb;
  border-radius: 16rpx;
  background: #f8fafc;
  color: #9ca3af;
}
</style>
