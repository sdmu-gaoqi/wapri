<script setup lang="ts">
import { reactive } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { ProForm, ProFormDependency, ProFormList, ProFormSelect, ProFormText } from '@wapri/element-pro'

const model = reactive<Record<string, unknown>>({
  items: [
    { kind: 'text', content: '第一行文本' },
    { kind: 'link', content: 'https://example.com' },
  ],
})

const kindEnum = {
  text: '文本',
  link: '链接',
}
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <ProForm
      :model="model"
      label-width="80px"
    >
      <ProFormList
        name="items"
        label="内容行"
        :initial-value="{ kind: 'text', content: '' }"
      >
        <ProFormSelect
          name="kind"
          label="类型"
          :value-enum="kindEnum"
          :col-props="{ span: 8 }"
        />
        <ProFormDependency
          :names="['kind']"
          v-slot="{ kind }"
        >
          <ProFormText
            name="content"
            :label="kind === 'link' ? '链接地址' : '文本内容'"
            :placeholder="kind === 'link' ? '请输入 https:// 开头的地址' : '请输入文本'"
            :col-props="{ span: 16 }"
          />
        </ProFormDependency>
      </ProFormList>
    </ProForm>
  </ElConfigProvider>
</template>
