<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElColorPicker, ElInput, ElMessage, ElPopover } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useConfig } from '../../ConfigProvider/context'
import { fileModalDefaultGroupColor, fileModalGroupNameMaxLength } from '../../constant'
import { filterGroups } from '../utils'
import type { FileModalCreateGroup, FileModalGroup } from '../types'

const props = defineProps<{
  groups: FileModalGroup[]
  activeId?: string
  /** 新建分组的外部 promise，未传时不展示「添加分组」 */
  createGroup?: FileModalCreateGroup
  addText: string
}>()

const emit = defineEmits<{
  select: [id: string | undefined]
  created: [group: FileModalGroup]
}>()

const { prefix } = useConfig()

defineOptions({ name: 'FileModalGroupPanel' })

const base = computed(() => `${prefix.value}-file-modal`)

/** 分组搜索只做本地过滤，不触发列表刷新 */
const keyword = ref('')
const visibleGroups = computed(() => filterGroups(props.groups, keyword.value))

/** 新建分组弹层的草稿状态 */
const createVisible = ref(false)
const draftName = ref('')
const draftColor = ref(fileModalDefaultGroupColor)
const submitting = ref(false)

const canSubmit = computed(() => draftName.value.trim().length > 0 && !submitting.value)

const resetDraft = (): void => {
  draftName.value = ''
  draftColor.value = fileModalDefaultGroupColor
}

const handleCreateVisibleChange = (value: boolean): void => {
  // 提交中不接受关闭，避免请求回来时草稿已被重置
  if (!value && submitting.value) return
  createVisible.value = value
  if (!value) resetDraft()
}

const submitCreate = async (): Promise<void> => {
  const name = draftName.value.trim()
  if (!name || !props.createGroup || submitting.value) return
  submitting.value = true
  try {
    const group = await props.createGroup({ name, color: draftColor.value })
    emit('created', group)
    createVisible.value = false
    resetDraft()
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : '新建分组失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <aside :class="`${base}__aside`">
    <ElInput
      v-model="keyword"
      :class="`${base}__group-search`"
      :prefix-icon="Search"
      placeholder="请输入分组名称"
      clearable
    />

    <div
      :class="`${base}__group-list`"
      role="listbox"
      aria-label="素材分组"
    >
      <button
        type="button"
        :class="[`${base}__group`, activeId === undefined && `${base}__group--active`]"
        role="option"
        :aria-selected="activeId === undefined"
        @click="emit('select', undefined)"
      >
        全部
      </button>
      <button
        v-for="group in visibleGroups"
        :key="group.id"
        type="button"
        :class="[`${base}__group`, activeId === group.id && `${base}__group--active`]"
        role="option"
        :aria-selected="activeId === group.id"
        :title="group.name"
        @click="emit('select', group.id)"
      >
        <span
          :class="`${base}__group-dot`"
          :style="{ backgroundColor: group.color || fileModalDefaultGroupColor }"
        ></span>
        <span :class="`${base}__group-name`">{{ group.name }}</span>
      </button>
      <p
        v-if="!visibleGroups.length"
        :class="`${base}__group-empty`"
      >
        暂无分组
      </p>
    </div>

    <ElPopover
      v-if="createGroup"
      :visible="createVisible"
      placement="top-start"
      :width="248"
      trigger="click"
      @update:visible="handleCreateVisibleChange"
    >
      <template #reference>
        <ElButton
          :class="`${base}__add-group`"
          plain
          type="primary"
        >
          {{ addText }}
        </ElButton>
      </template>

      <div :class="`${base}__create`">
        <ElInput
          v-model="draftName"
          :class="`${base}__create-name`"
          :maxlength="fileModalGroupNameMaxLength"
          placeholder="请输入分组名称"
          show-word-limit
          @keyup.enter="submitCreate"
        />
        <div :class="`${base}__create-footer`">
          <span :class="`${base}__create-color`">
            <span :class="`${base}__create-color-label`">颜色</span>
            <ElColorPicker v-model="draftColor" />
          </span>
          <span :class="`${base}__create-actions`">
            <ElButton
              text
              size="small"
              @click="handleCreateVisibleChange(false)"
            >
              取消
            </ElButton>
            <ElButton
              type="primary"
              size="small"
              :disabled="!canSubmit"
              :loading="submitting"
              @click="submitCreate"
            >
              确定
            </ElButton>
          </span>
        </div>
      </div>
    </ElPopover>
  </aside>
</template>
