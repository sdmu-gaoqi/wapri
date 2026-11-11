<script setup lang="ts" generic="T extends FileModalAsset">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ElButton, ElDialog, ElImageViewer, ElInput, ElOption, ElSelect, vLoading } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useLockFn } from '@wapri/ghooks'
import { debounce } from '@wapri/gutils'
import ProTable from '../ProTable/index.vue'
import FileModalAssetCard from './components/FileModalAssetCard.vue'
import FileModalGroupPanel from './components/FileModalGroupPanel.vue'
import FileModalUploadButton from './components/FileModalUploadButton.vue'
import { useConfig } from '../ConfigProvider/context'
import {
  fileModalDefaultColumns,
  fileModalDefaultPageSize,
  fileModalPageSizeOptions,
  fileModalSortOptions,
  fileModalUploadText,
} from '../constant'
import {
  getAssetMediaType,
  getAssetPreviewUrl,
  isAssetSelected,
  pickSelectedAssets,
  resolveNextSelected,
} from './utils'
import type {
  ActionType,
  FilterState,
  Key,
  ProTableRequestContext,
  RequestParams,
  RequestResult,
  SortState,
} from '../ProTable/types'
import type {
  FileModalAsset,
  FileModalEmits,
  FileModalGroup,
  FileModalGroupPayload,
  FileModalProps,
  FileModalQuery,
  FileModalRequest,
  FileModalSortValue,
} from './types'
import './styles/index.scss'

const props = withDefaults(defineProps<FileModalProps<T>>(), {
  open: false,
  columns: fileModalDefaultColumns,
  groups: () => [],
  multiple: false,
  title: '选择素材',
  confirmText: '确定',
  cancelText: '取消',
  uploadText: fileModalUploadText,
  addGroupText: '添加分组',
  emptyText: '暂无素材',
  // 默认不裁剪：选完图片直接上传原图
  cropperRatios: () => [],
  cropperRatioLabels: () => [],
  cropperTitle: '裁剪图片',
})

const emit = defineEmits<FileModalEmits<T>>()

const { prefix } = useConfig()

defineOptions({ name: 'FileModal' })

const base = computed(() => `${prefix.value}-file-modal`)

const tableRef = ref<ActionType<T>>()

/** 分组：以 props 为初始值，新建成功后追加到本地副本 */
const groupList = ref<FileModalGroup[]>([...(props.groups ?? [])])
watch(
  () => props.groups,
  (next) => {
    groupList.value = [...(next ?? [])]
  },
  { deep: true },
)

const activeGroupId = ref<string | undefined>()

/** 搜索框输入与真正生效的关键词分开，避免每个按键都触发请求 */
const searchText = ref('')
const keyword = ref('')
const applyKeyword = debounce((value: string) => {
  keyword.value = value.trim()
}, 300)

const handleSearchInput = (value: string): void => {
  searchText.value = value
  applyKeyword(value)
}

const sortBy = ref<FileModalSortValue>('latest')

/** ElSelect 的 update:modelValue 是宽类型，这里收敛到组件内置的排序枚举 */
const handleSortChange = (value: unknown): void => {
  if (value === 'latest' || value === 'name' || value === 'size') sortBy.value = value
}

/** 传给 ProTable 的业务参数，params 变化会自动回到第一页并重新请求 */
const queryParams = computed<FileModalQuery>(() => ({
  keyword: keyword.value || undefined,
  sortBy: sortBy.value,
  groupId: activeGroupId.value,
}))

/** 列表请求中 / 新建分组中：弹窗加 loading 并禁止点击 */
const pendingCount = ref(0)
const requesting = computed(() => pendingCount.value > 0)
const creatingGroup = ref(false)
const busy = computed(() => requesting.value || creatingGroup.value)

/** useLockFn 保证同一时刻只有一个请求在途，避免搜索连续变化时重复调用 */
const lockedRequest = useLockFn(
  async (
    params: RequestParams<FileModalQuery>,
    sort: SortState,
    filter: FilterState,
    context: ProTableRequestContext,
  ): Promise<RequestResult<T>> => {
    return props.request(params, sort, filter, context)
  },
)

/**
 * 请求串行化：`useLockFn` 保证同一时刻只有一个请求在途，
 * `tail` 把后来的调用排到前一个之后，既不并发也不丢调用，
 * 最终采用哪一次结果由 ProTable 内部的 requestId 决定。
 */
let tail: Promise<unknown> = Promise.resolve()
/** 上一次成功的结果，作为极端情况下（被锁挡下）的兜底，避免把列表置空 */
let lastResult: RequestResult<T> | undefined

const request: FileModalRequest<T> = (params, sort, filter, context) => {
  pendingCount.value += 1
  const task = tail
    .then(() => lockedRequest(params, sort, filter, context))
    .then((result) => {
      if (result) lastResult = result
      return lastResult ?? { data: [], total: 0 }
    })
    .finally(() => {
      pendingCount.value = Math.max(0, pendingCount.value - 1)
    })
  tail = task.catch(() => undefined)
  return task
}

/** 选中项：受控优先，未受控时组件内部维护 */
const innerSelected = ref<Key[]>([])
const selectedKeys = computed<Key[]>(() => props.selected ?? innerSelected.value)

const updateSelected = (keys: Key[]): void => {
  innerSelected.value = keys
  emit('update:selected', keys)
}

/** 已加载过的素材按 id 缓存，跨页选择后仍能回传完整记录 */
const assetCache = new Map<Key, T>()

/** ProTable 的插槽与事件给不出泛型信息，这里统一收敛回 T */
const toAsset = (value: unknown): T => value as T

const handleLoad = (rows: object[]): void => {
  rows.forEach((row) => {
    const asset = toAsset(row)
    assetCache.set(asset.id, asset)
  })
}

const handleToggle = (asset: T): void => {
  updateSelected(resolveNextSelected(selectedKeys.value, asset.id, props.multiple))
}

/** 内置预览：图片走 ElImageViewer，视频走弹窗内的 <video> */
const previewVisible = ref(false)
const previewKind = ref<'image' | 'video'>('image')
const previewSrc = ref('')
const previewTitle = ref('')

const handlePreview = (asset: T): void => {
  const mediaType = getAssetMediaType(asset)
  if (mediaType === 'other') return
  previewKind.value = mediaType
  previewSrc.value = getAssetPreviewUrl(asset)
  previewTitle.value = asset.name
  previewVisible.value = true
}

const closePreview = (): void => {
  previewVisible.value = false
  previewSrc.value = ''
}

const handleGroupChange = (id: string | undefined): void => {
  activeGroupId.value = id
  emit('groupChange', id)
}

/** 新建分组期间给弹窗加 loading，成功后直接切到该分组 */
const handleCreateGroup = async (payload: FileModalGroupPayload): Promise<FileModalGroup> => {
  if (!props.createGroup) throw new Error('未配置新建分组方法')
  creatingGroup.value = true
  try {
    return await props.createGroup(payload)
  } finally {
    creatingGroup.value = false
  }
}

const handleGroupCreated = (group: FileModalGroup): void => {
  groupList.value = [...groupList.value, group]
  // 新建后直接切到该分组，否则用户看不到刚建出来的分组有什么用
  handleGroupChange(group.id)
  emit('groupCreated', group)
}

const handleUploaded = async (asset: T): Promise<void> => {
  assetCache.set(asset.id, asset)
  updateSelected(props.multiple ? [...selectedKeys.value, asset.id] : [asset.id])
  emit('uploaded', asset)
  await tableRef.value?.reload(true)
}

const handleUploadError = (error: Error): void => {
  emit('uploadError', error)
}

const handleConfirm = (): void => {
  emit('confirm', pickSelectedAssets(assetCache, selectedKeys.value))
  emit('update:open', false)
}

const handleCancel = (): void => {
  emit('cancel')
  emit('update:open', false)
}

/** loading 期间不接受任何关闭动作，避免请求回来时组件已卸载 */
const handleVisibleChange = (value: boolean): void => {
  if (busy.value) return
  if (value) {
    emit('update:open', true)
    return
  }
  handleCancel()
}

/** 打开时重置搜索与缓存，配合 destroy-on-close 保证每次都是干净的一次选择 */
watch(
  () => props.open,
  (open) => {
    if (!open) {
      applyKeyword.cancel()
      return
    }
    searchText.value = ''
    keyword.value = ''
  },
)

onBeforeUnmount(() => {
  applyKeyword.cancel()
})
</script>

<template>
  <ElDialog
    v-bind="modalProps"
    :class="base"
    :model-value="open"
    :title="title"
    :width="modalProps?.width ?? '920px'"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="!busy"
    :close-on-press-escape="!busy"
    @update:model-value="handleVisibleChange"
  >
    <div
      v-loading="busy"
      :class="`${base}__body`"
      element-loading-text="加载中…"
    >
      <FileModalGroupPanel
        :class="`${base}__aside`"
        :groups="groupList"
        :active-id="activeGroupId"
        :create-group="createGroup ? handleCreateGroup : undefined"
        :add-text="addGroupText"
        @select="handleGroupChange"
        @created="handleGroupCreated"
      />

      <div :class="`${base}__main`">
        <div :class="`${base}__toolbar`">
          <FileModalUploadButton
            v-if="upload"
            :upload="upload"
            :group-id="activeGroupId"
            :text="uploadText"
            :ratios="cropperRatios"
            :ratio-labels="cropperRatioLabels"
            :title="cropperTitle"
            accept="image/*"
            @uploaded="handleUploaded"
            @error="handleUploadError"
          />

          <div :class="`${base}__filters`">
            <ElInput
              :model-value="searchText"
              :class="`${base}__search`"
              :prefix-icon="Search"
              placeholder="请输入素材名称"
              clearable
              @update:model-value="handleSearchInput"
            />
            <ElSelect
              :model-value="sortBy"
              :class="`${base}__sort`"
              aria-label="排序方式"
              @update:model-value="handleSortChange"
            >
              <ElOption
                v-for="option in fileModalSortOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </div>
        </div>

        <ProTable
          ref="tableRef"
          :class="`${base}__table`"
          :columns="[]"
          :request="request"
          :params="queryParams"
          :modes="['list']"
          :list-props="{ columns, gap: 12 }"
          :search="false"
          :options="false"
          :sticky="false"
          :row-key="'id'"
          :pagination="{ pageSize: fileModalDefaultPageSize, pageSizeOptions: fileModalPageSizeOptions }"
          @load="handleLoad"
        >
          <template #itemRender="{ item }">
            <FileModalAssetCard
              :asset="toAsset(item)"
              :active="isAssetSelected(selectedKeys, toAsset(item).id)"
              @toggle="handleToggle(toAsset(item))"
              @preview="handlePreview(toAsset(item))"
            />
          </template>
          <template #empty>
            <span :class="`${base}__empty`">{{ emptyText }}</span>
          </template>
        </ProTable>
      </div>
    </div>

    <template #footer>
      <ElButton
        :disabled="busy"
        @click="handleCancel"
      >
        {{ cancelText }}
      </ElButton>
      <ElButton
        type="primary"
        :disabled="busy || !selectedKeys.length"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </ElButton>
    </template>
  </ElDialog>

  <ElImageViewer
    v-if="previewVisible && previewKind === 'image'"
    :url-list="[previewSrc]"
    teleported
    @close="closePreview"
  />

  <ElDialog
    :class="`${base}__preview-dialog`"
    :model-value="previewVisible && previewKind === 'video'"
    :title="previewTitle"
    width="720px"
    append-to-body
    destroy-on-close
    @update:model-value="closePreview"
  >
    <video
      :class="`${base}__video`"
      :src="previewSrc"
      controls
      autoplay
    ></video>
  </ElDialog>
</template>
