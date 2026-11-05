<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElForm, ElFormItem } from 'element-plus'
import 'element-plus/dist/index.css'
import { CheckCard, CheckCardGroup, type CheckCardGroupValue } from '@wapri/element-pro'

const services = ref<CheckCardGroupValue>(['delivery'])
const plan = ref<CheckCardGroupValue>('standard')
const checked = ref(false)
const options = [
  { value: 'standard', title: '标准版', description: '适合日常经营，包含基础商品与订单管理。' },
  { value: 'advanced', title: '专业版', description: '包含数据分析与团队协作能力。' },
  { value: 'enterprise', title: '企业版', description: '暂未开放', disabled: true },
]
</script>

<template>
  <ElForm label-position="top">
    <ElFormItem label="单选套餐（再次点击可取消）">
      <CheckCardGroup
        v-model="plan"
        :options="options"
        aria-label="选择套餐"
      />
    </ElFormItem>
    <ElFormItem label="多选服务">
      <CheckCardGroup
        v-model="services"
        multiple
        aria-label="选择服务"
      >
        <CheckCard
          value="delivery"
          title="配送服务"
          description="提供订单配送及物流跟踪。"
        >
          <template #avatar>🚚</template>
          <template #extra>
            <ElButton
              link
              type="primary"
            >
              详情
            </ElButton>
          </template>
        </CheckCard>
        <CheckCard
          value="support"
          title="专属客服"
        >
          <template #description>为店铺提供专属服务支持。</template>
        </CheckCard>
        <CheckCard
          value="offline"
          title="线下服务"
          description="暂未开放"
          disabled
        />
      </CheckCardGroup>
    </ElFormItem>
    <ElFormItem label="独立卡片">
      <CheckCard
        v-model:checked="checked"
        title="开启消息提醒"
        description="接收订单状态通知。"
      />
    </ElFormItem>
    <ElFormItem label="加载状态">
      <CheckCard
        loading
        title="加载中"
      />
    </ElFormItem>
  </ElForm>
</template>
