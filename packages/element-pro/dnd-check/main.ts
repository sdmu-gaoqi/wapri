import { createApp, h, ref } from 'vue'
import { ElConfigProvider, ElSwitch } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import { configurePdfjs } from '@wapri/preview'
import DragSortTable from '../src/DragSortTable/index.vue'
import CropperUpload from '../src/CropperUpload/index.vue'
import FileList from '../src/FileList/index.vue'
import type { ProColumn } from '../src/ProTable/types'
import type { UploadUserFile } from 'element-plus'
import type { FileListItem } from '../src/FileList/types'

configurePdfjs({ workerSrc: './pdf.worker.min.mjs' })

interface Row {
  id: number
  sort: number
  title: string
  owner: string
}

const rows = ref<Row[]>([
  { id: 1, sort: 1, title: '双十一主会场', owner: '陈默' },
  { id: 2, sort: 2, title: '品类日 · 家电', owner: '林岚' },
  { id: 3, sort: 3, title: '新人礼包', owner: '周叙' },
  { id: 4, sort: 4, title: '会员专享折扣', owner: '苏晚' },
])

const columns: ProColumn<Row>[] = [
  { title: '排序', dataIndex: 'sort', width: 72, columnProps: { align: 'center' } },
  { title: '轮播标题', dataIndex: 'title' },
  { title: '负责人', dataIndex: 'owner' },
]

const swatch = (hue: number, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="hsl(${hue} 65% 62%)"/><text x="120" y="134" font-size="40" text-anchor="middle" fill="#fff">${label}</text></svg>`,
  )}`

const files = ref<UploadUserFile[]>(
  [20, 140, 260].map((hue, index) => ({
    name: `pic-${index + 1}.png`,
    url: swatch(hue, String(index + 1)),
    uid: index + 1,
    status: 'success',
  })),
)

const fileItems = ref<FileListItem[]>([
  { id: 'f-1', name: '商品主图_01.png', abbreviateUrl: swatch(100, '01'), previewUrl: swatch(100, '01') },
  { id: 'f-2', name: '产品演示视频.mp4', abbreviateUrl: swatch(190, 'MP4'), previewUrl: '' },
  { id: 'f-3', name: '产品说明书.pdf', abbreviateUrl: swatch(260, 'PDF'), previewUrl: './demo/sample.pdf' },
])

const app = createApp({
  setup() {
    return () =>
      h(ElConfigProvider, { locale: zhCn }, () => [
        h('div', { class: 'block' }, [
          h('h3', {}, 'FileList（PDF 应走文档预览弹窗，视频角标应居中）'),
          h(FileList, {
            'data': fileItems.value,
            'onUpdate:data': (next: FileListItem[]) => {
              fileItems.value = next
            },
            'columns': 4,
            'onPreview': (item: FileListItem) => {
              const out = document.querySelector('#flog')
              if (out) out.textContent = `preview: ${item.name}`
            },
          }),
          h('pre', { id: 'flog', style: 'color:#67c23a' }, ''),
        ]),
      ])
  },
})

app.mount('#app')
