<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElInput, ElMessage, ElMessageBox } from 'element-plus'
import { MoreFilled, Search } from '@element-plus/icons-vue'
import { useConfig } from '../../ConfigProvider/context'
import { fileModalDefaultGroupColor, fileModalGroupMaxDepth, fileModalGroupMoreText } from '../../constant'
import FileModalGroupDialog from './FileModalGroupDialog.vue'
import { buildGroupTree, flattenGroupTree, getGroupPath } from '../utils'
import type {
  FileModalCreateGroup,
  FileModalGroup,
  FileModalGroupFormValue,
  FileModalGroupPayload,
  FileModalRemoveGroup,
  FileModalUpdateGroup,
} from '../types'

const props = defineProps<{
  groups: FileModalGroup[]
  activeId?: string
  /** 新建分组的外部 promise，未传时不展示「添加分类」 */
  createGroup?: FileModalCreateGroup
  /** 编辑分组的外部 promise，未传时不展示「编辑分类」 */
  updateGroup?: FileModalUpdateGroup
  /** 删除分组的外部 promise，未传时不展示「删除分类」 */
  removeGroup?: FileModalRemoveGroup
  addText: string
  editText: string
  removeText: string
  removeConfirmText: string
}>()

const emit = defineEmits<{
  select: [id: string | undefined]
  created: [group: FileModalGroup, parentId?: string]
  updated: [group: FileModalGroup, parentId?: string]
  removed: [group: FileModalGroup]
}>()

const { prefix } = useConfig()

defineOptions({ name: 'FileModalGroupPanel' })

const base = computed(() => `${prefix.value}-file-modal`)

/** 分组搜索只做本地过滤，不触发列表刷新 */
const keyword = ref('')

/** 分类树按展示顺序展开成行，深度用于左侧缩进 */
const groupRows = computed(() => flattenGroupTree(props.groups))

/** 搜索命中的行保留原有深度，子分组的位置关系不会因为过滤而错乱 */
const visibleRows = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  if (!text) return groupRows.value
  return groupRows.value.filter((row) => row.group.name.toLowerCase().includes(text))
})

/** 新建 / 编辑 / 删除都在途时锁住「更多操作」，同一时刻只处理一个分组 */
const pendingId = ref<string>()
const pending = computed(() => pendingId.value !== undefined)
const creating = ref(false)

/** 分类弹窗：新建与编辑共用，`editing` 为空即新建 */
const dialogOpen = ref(false)
const editing = ref<FileModalGroup>()
/** 新建时的上级分类：从某一行的「添加分类」进入时预填 */
const creatingParent = ref<FileModalGroup>()

const dialogTitle = computed(() => (editing.value ? props.editText : props.addText))

/** 分类所在的层级，一级分类为 1 */
const depthOf = (group: FileModalGroup): number => getGroupPath(props.groups, group.id).length

/** 分组的上级分组 id，未挂在任何分类下时为空 */
const parentIdOf = (group: FileModalGroup): string | undefined =>
  getGroupPath(props.groups, group.id).slice(0, -1).pop()?.id

/** 编辑时回填名称与上级分类路径（一级 → 直接上级） */
const dialogName = computed(() => (editing.value ? editing.value.name : ''))
const dialogParentPath = computed(() => {
  const current = editing.value ?? creatingParent.value
  if (!current) return []
  const path = getGroupPath(props.groups, current.id)
  // 新建时点的是「在哪一级下加」，这一级就是上级；编辑时上级是它的父级
  return (editing.value ? path.slice(0, -1) : path).map((group) => group.id)
})

/**
 * 「上级分类」候选：编辑时整棵子树都不出现，否则会出现「把自己挂到自己下面」的环；
 * 最深一级不再往下展开，分类最多 `fileModalGroupMaxDepth` 级。
 */
const dialogParentOptions = computed(() => buildGroupTree(props.groups, editing.value?.id))

const openCreate = (parent?: FileModalGroup): void => {
  if (!props.createGroup || creating.value) return
  editing.value = undefined
  creatingParent.value = parent
  dialogOpen.value = true
}

const openEdit = (group: FileModalGroup): void => {
  if (!props.updateGroup || pending.value) return
  creatingParent.value = undefined
  editing.value = group
  dialogOpen.value = true
}

/** 弹窗返回 true 表示成功，交给弹窗自己关闭；失败保持打开，输入不丢 */
const handleDialogSubmit = async (value: FileModalGroupFormValue): Promise<boolean> => {
  const current = editing.value

  if (!current) {
    if (!props.createGroup || creating.value) return false
    creating.value = true
    try {
      const group = await props.createGroup({ ...value, color: fileModalDefaultGroupColor })
      ElMessage.success(`${props.addText}成功`)
      emit('created', group, value.parentId)
      return true
    } catch (error: unknown) {
      ElMessage.error(error instanceof Error ? error.message : `${props.addText}失败`)
      return false
    } finally {
      creating.value = false
    }
  }

  if (!props.updateGroup || pending.value) return false
  // 名称与上级都没改动时直接关掉，不必打一次空请求
  if (value.name === current.name && value.parentId === parentIdOf(current)) return true

  const payload: FileModalGroupPayload = { ...value, color: current.color ?? fileModalDefaultGroupColor }
  pendingId.value = current.id
  try {
    const updated = await props.updateGroup(current, payload)
    ElMessage.success(`${props.editText}成功`)
    emit('updated', { ...current, ...updated }, value.parentId)
    return true
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : `${props.editText}失败`)
    return false
  } finally {
    pendingId.value = undefined
  }
}

/**
 * 删除分组：真正的删除逻辑由使用方的 `removeGroup` 提供，
 * 组件只负责二次确认与按钮 loading，成功后由父级移除并处理当前选中的分组。
 */
const handleRemove = async (group: FileModalGroup): Promise<void> => {
  if (!props.removeGroup || pending.value) return
  try {
    await ElMessageBox.confirm(props.removeConfirmText, props.removeText, {
      type: 'warning',
      confirmButtonText: props.removeText,
      cancelButtonText: '取消',
    })
  } catch {
    // 使用方取消，什么都不做
    return
  }
  pendingId.value = group.id
  try {
    await props.removeGroup(group)
    ElMessage.success(`${props.removeText}成功`)
    emit('removed', group)
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : `${props.removeText}失败`)
  } finally {
    pendingId.value = undefined
  }
}

/** 「更多操作」下拉：新建、编辑、删除都从这里进入 */
const handleCommand = (command: unknown, group: FileModalGroup): void => {
  if (command === 'create') openCreate(group)
  if (command === 'edit') openEdit(group)
  if (command === 'remove') void handleRemove(group)
}

/** 左侧列表的行缩进：一级分组不缩进，子分组每层缩进 12px */
const rowIndent = (depth: number): Record<string, string> | undefined =>
  depth ? { paddingLeft: `${depth * 12}px` } : undefined
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
      <div
        v-for="row in visibleRows"
        :key="row.group.id"
        :class="[
          `${base}__group-row`,
          activeId === row.group.id && `${base}__group-row--active`,
          row.depth > 0 && `${base}__group-row--nested`,
        ]"
        :style="rowIndent(row.depth)"
      >
        <button
          type="button"
          :class="[`${base}__group`, activeId === row.group.id && `${base}__group--active`]"
          role="option"
          :aria-selected="activeId === row.group.id"
          :title="row.group.name"
          @click="emit('select', row.group.id)"
        >
          <span :class="`${base}__group-name`">{{ row.group.name }}</span>
        </button>
        <ElDropdown
          v-if="createGroup || updateGroup || removeGroup"
          trigger="click"
          placement="bottom-end"
          :hide-on-click="true"
          @command="handleCommand($event, row.group)"
        >
          <ElButton
            :class="`${base}__group-more`"
            text
            circle
            size="small"
            :icon="MoreFilled"
            :loading="pendingId === row.group.id"
            :aria-label="`${row.group.name} ${fileModalGroupMoreText}`"
            :title="fileModalGroupMoreText"
            @click.stop
          />
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                v-if="createGroup"
                command="create"
                :disabled="depthOf(row.group) >= fileModalGroupMaxDepth"
              >
                {{ addText }}
              </ElDropdownItem>
              <ElDropdownItem
                v-if="updateGroup"
                command="edit"
              >
                {{ editText }}
              </ElDropdownItem>
              <ElDropdownItem
                v-if="removeGroup"
                command="remove"
                divided
              >
                {{ removeText }}
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>
      <p
        v-if="!visibleRows.length"
        :class="`${base}__group-empty`"
      >
        暂无分组
      </p>
    </div>

    <ElButton
      v-if="createGroup"
      :class="`${base}__add-group`"
      plain
      type="primary"
      :loading="creating"
      @click="openCreate()"
    >
      {{ addText }}
    </ElButton>

    <FileModalGroupDialog
      v-model:open="dialogOpen"
      :title="dialogTitle"
      :parent-options="dialogParentOptions"
      :name="dialogName"
      :parent-path="dialogParentPath"
      :on-submit="handleDialogSubmit"
    />
  </aside>
</template>
