<script setup lang="ts">
import { reactive } from 'vue'
import { ElConfigProvider, ElRow, ElTag } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProForm, ProFormDependency, ProFormSelect, ProFormText } from '@wapri/element-pro'

const model = reactive<Record<string, unknown>>({
  type: 'preset',
  presetName: '标准模板',
  customName: '',
  province: 'zhejiang',
  city: 'hangzhou',
  level: 'high',
  profile: { level: 'vip' },
})

const typeEnum = {
  preset: '预设模板',
  custom: '自定义模板',
}

const provinceEnum = {
  zhejiang: '浙江',
  jiangsu: '江苏',
}

const cityEnumMap: Record<string, Record<string, string>> = {
  zhejiang: { hangzhou: '杭州', ningbo: '宁波' },
  jiangsu: { nanjing: '南京', suzhou: '苏州' },
}

const levelEnum = {
  high: '高',
  low: '低',
}

/** 省份变化时切换城市选项；未选省份时给空选项。 */
const cityEnumOf = (province: unknown): Record<string, string> => {
  return typeof province === 'string' ? (cityEnumMap[province] ?? {}) : {}
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProForm
      :model="model"
      label-width="120px"
    >
      <ElRow>
        <ProFormSelect
          name="type"
          label="模板类型"
          :value-enum="typeEnum"
          :col-props="{ span: 12 }"
        />
        <ProFormDependency
          :names="['type']"
          v-slot="{ type }"
        >
          <ProFormText
            v-if="type === 'preset'"
            name="presetName"
            label="预设名称"
            :col-props="{ span: 12 }"
          />
          <ProFormText
            v-else
            name="customName"
            label="自定义名称"
            :col-props="{ span: 12 }"
          />
        </ProFormDependency>

        <ProFormSelect
          name="province"
          label="省份"
          :value-enum="provinceEnum"
          :col-props="{ span: 12 }"
        />
        <ProFormDependency
          :names="['province']"
          v-slot="{ province }"
        >
          <ProFormSelect
            name="city"
            label="城市"
            :value-enum="cityEnumOf(province)"
            :col-props="{ span: 12 }"
          />
        </ProFormDependency>

        <ProFormSelect
          name="level"
          label="等级"
          :value-enum="levelEnum"
          :col-props="{ span: 12 }"
        />
        <ProFormDependency
          :names="['level', 'profile.level']"
          v-slot="{ level, 'profile.level': profileLevel }"
        >
          <ElCol :span="12">
            <div class="dependency-result">
              <span>订阅结果：</span>
              <ElTag>level = {{ level ?? 'undefined' }}</ElTag>
              <ElTag>profile.level = {{ profileLevel ?? 'undefined' }}</ElTag>
            </div>
          </ElCol>
        </ProFormDependency>
      </ElRow>
    </ProForm>
  </ElConfigProvider>
</template>

<style scoped>
.dependency-result {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 32px;
}
</style>
