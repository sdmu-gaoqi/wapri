<!--
  Skills 安装面板：选编程工具 → 选项目目录 → 直接把 skills/wapri-design 写进去。

  技能文案来自文档站静态目录 `public/skills/wapri-design/`（构建时同步进 `@wapri/mcp` 包），
  这里只负责按各客户端的约定路径落盘，不在页面里再维护一份文案。
  dotagents 走 `.agents/skills` 标准：文件名用小写 `skill.md`，frontmatter 额外带 `id` / `kind`。
-->
<script lang="ts">
/** 文档站部署前缀，由 .dumirc.ts 的 define 注入（dev 与构建都生效） */
declare const __DOC_PUBLIC_PATH__: string

interface DirectoryHandleLike {
  getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<DirectoryHandleLike>
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileHandleLike>
  /** 真实 FileSystemDirectoryHandle 有这两个方法；mock 或老浏览器可能没有 */
  queryPermission?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<string>
  requestPermission?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<string>
}

interface FileHandleLike {
  createWritable: () => Promise<{ write: (data: string) => Promise<void>; close: () => Promise<void> }>
}

interface PickerWindow {
  showDirectoryPicker?: (options?: { id?: string; mode?: 'read' | 'readwrite' }) => Promise<DirectoryHandleLike>
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface ToolOption {
  /** 勾选用的唯一 id */
  id: string
  label: string
  /** 项目内的落盘目录（相对项目根） */
  dir: string
  note: string
  /** 该文件工具要写入的文件：[来源文件名, 目标文件名]；缺省用 DEFAULT_FILES */
  files?: ReadonlyArray<readonly [string, string]>
}

/** 技能目录名，与 public/skills 下的目录保持一致 */
const SKILL_DIR = 'wapri-design'

/** 大多数客户端：沿用 Claude Skills 的 SKILL.md 约定 */
const DEFAULT_FILES: ReadonlyArray<readonly [string, string]> = [
  ['SKILL.md', 'SKILL.md'],
  ['WORKFLOWS.md', 'WORKFLOWS.md'],
  ['BEST_PRACTICES.md', 'BEST_PRACTICES.md'],
]

/**
 * dotagents：.agents/skills/<id>/skill.md，frontmatter 必须有 id。
 * 同时写一份 SKILL.md 兼容仍按大写文件名扫描的跨工具客户端（大小写不敏感的系统写两次同一个文件，无害）。
 */
const DOTAGENTS_SKILL_FILE = 'skill.dotagents.md'
const DOTAGENTS_FILES: ReadonlyArray<readonly [string, string]> = [
  [DOTAGENTS_SKILL_FILE, 'skill.md'],
  [DOTAGENTS_SKILL_FILE, 'SKILL.md'],
  ['WORKFLOWS.md', 'WORKFLOWS.md'],
  ['BEST_PRACTICES.md', 'BEST_PRACTICES.md'],
]

/** 不支持目录写入时展示的下载项：[来源文件名, 展示名] */
const DOWNLOAD_FILES: ReadonlyArray<readonly [string, string]> = [
  ['SKILL.md', 'SKILL.md'],
  ['WORKFLOWS.md', 'WORKFLOWS.md'],
  ['BEST_PRACTICES.md', 'BEST_PRACTICES.md'],
  [DOTAGENTS_SKILL_FILE, 'skill.md（dotagents）'],
]

/** 各客户端读取 Skills 的约定目录，与 Semi 的面板一致 */
const TOOLS: ToolOption[] = [
  {
    id: 'dotagents',
    label: 'dotagents（.agents 标准）',
    dir: '.agents/skills',
    note: '跨工具约定；写 skill.md 并补 id / kind frontmatter',
    files: DOTAGENTS_FILES,
  },
  { id: 'trae', label: 'Trae', dir: '.trae/skills', note: '字节跳动 AI 原生编程 IDE，支持 Skills' },
  { id: 'cursor', label: 'Cursor', dir: '.cursor/skills', note: 'AI 增强代码编辑器，需开启 Nightly 渠道' },
  { id: 'codebuddy', label: 'CodeBuddy（腾讯云）', dir: '.codebuddy/skills', note: '腾讯云 AI 编程助手，支持 Skills' },
  { id: 'claude', label: 'Claude Code', dir: '.claude/skills', note: 'Anthropic 官方 AI 编程助手，支持 Skills' },
  { id: 'qwen', label: 'Qwen Code（通义千问）', dir: '.qwen/skills', note: '阿里巴巴 AI 编程助手，支持 Skills' },
  { id: 'codex', label: 'OpenAI Codex CLI', dir: '.codex/skills', note: 'OpenAI 官方 CLI，支持 Skills' },
  { id: 'standard', label: '通用标准', dir: '.skills', note: '通用 Skills 目录标准（部分工具支持）' },
]

const publicPath = (): string => (typeof __DOC_PUBLIC_PATH__ === 'string' ? __DOC_PUBLIC_PATH__ : '/')

const selected = ref<string[]>(['cursor'])
const status = ref('')
const tone = ref<'idle' | 'ok' | 'error'>('idle')
const busy = ref(false)

/** 浏览器是否支持目录写入（Firefox / Safari 目前不支持，走下载兜底） */
const canWrite = typeof window !== 'undefined' && 'showDirectoryPicker' in window

const targets = computed(() => TOOLS.filter((tool) => selected.value.includes(tool.id)))

/** 将要写入的路径，给用户一个确认感 */
const targetHint = computed(() => targets.value.map((tool) => `${tool.dir}/${SKILL_DIR}`).join('、'))

const fileUrl = (name: string): string => `${publicPath()}skills/${SKILL_DIR}/${name}`

const toggle = (id: string): void => {
  selected.value = selected.value.includes(id) ? selected.value.filter((item) => item !== id) : [...selected.value, id]
  status.value = ''
  tone.value = 'idle'
}

/** 从站点静态目录取本次勾选工具需要的源文件，读不到就明确报错，不要写半截内容 */
const loadSkillFiles = async (): Promise<Map<string, string>> => {
  const sources = [...new Set(targets.value.flatMap((tool) => (tool.files ?? DEFAULT_FILES).map(([source]) => source)))]
  const entries = await Promise.all(
    sources.map(async (name) => {
      const response = await fetch(fileUrl(name))
      if (!response.ok) throw new Error(`读取 ${name} 失败（HTTP ${response.status}）`)
      return [name, await response.text()] as [string, string]
    }),
  )
  return new Map(entries)
}

/** 逐级创建目录，返回最里层的句柄 */
const ensureDirectory = async (root: DirectoryHandleLike, segments: string[]): Promise<DirectoryHandleLike> => {
  let current = root
  for (const segment of segments) {
    current = await current.getDirectoryHandle(segment, { create: true })
  }
  return current
}

const writeFile = async (dir: DirectoryHandleLike, name: string, content: string): Promise<void> => {
  const handle = await dir.getFileHandle(name, { create: true })
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

/** 有些浏览器选目录只给读权限，写之前显式确认一次；没有权限 API 的老浏览器交给 createWritable 自己判断 */
const ensureWritePermission = async (handle: DirectoryHandleLike): Promise<void> => {
  const options = { mode: 'readwrite' as const }
  const query = handle.queryPermission
  const request = handle.requestPermission

  if (typeof query === 'function' && (await query.call(handle, options)) === 'granted') return
  if (typeof request === 'function' && (await request.call(handle, options)) === 'granted') return
  if (typeof query === 'function' || typeof request === 'function') {
    throw new Error('未获得文件夹写入权限，请在权限弹窗中点「允许」')
  }
}

const install = async (): Promise<void> => {
  const picker = (window as unknown as PickerWindow).showDirectoryPicker
  if (!picker) return
  if (!targets.value.length) {
    status.value = '先勾选至少一个编程工具'
    tone.value = 'error'
    return
  }

  busy.value = true
  status.value = ''
  tone.value = 'idle'

  try {
    status.value = '请在选择文件夹的弹窗里点「选择文件夹」…'
    // 固定 id 让浏览器记住上一次选过的目录，下次不用重新找项目
    const root = await picker({ id: 'wapri-skills', mode: 'readwrite' })
    status.value = '正在确认文件夹写入权限…'
    await ensureWritePermission(root)
    status.value = '正在读取技能文件…'
    const files = await loadSkillFiles()

    for (const tool of targets.value) {
      status.value = `正在写入 ${tool.dir}/ ...`
      const dir = await ensureDirectory(root, [...tool.dir.split('/'), SKILL_DIR])
      for (const [source, target] of tool.files ?? DEFAULT_FILES) {
        const content = files.get(source)
        if (content === undefined) throw new Error(`缺少技能文件：${source}`)
        await writeFile(dir, target, content)
      }
    }

    status.value = `已写入 ${targets.value.length} 个目录：${targetHint.value}`
    tone.value = 'ok'
  } catch (error) {
    // 用户在选择目录时点取消，不算失败
    if ((error as DOMException | undefined)?.name === 'AbortError') {
      status.value = ''
      return
    }
    status.value = `写入失败：${error instanceof Error ? error.message : String(error)}`
    tone.value = 'error'
  } finally {
    busy.value = false
  }
}

const reset = (): void => {
  selected.value = ['cursor']
  status.value = ''
  tone.value = 'idle'
}
</script>

<template>
  <div class="wapri-install">
    <div class="wapri-install__head">
      <span class="wapri-install__title">添加到我的项目</span>
      <span class="wapri-install__sub">选择要把 Skills 添加到的编程工具</span>
    </div>

    <ul class="wapri-install__list">
      <li
        v-for="tool in TOOLS"
        :key="tool.id"
        class="wapri-install__item"
        :class="{ 'is-checked': selected.includes(tool.id) }"
      >
        <label class="wapri-install__label">
          <input
            type="checkbox"
            class="wapri-install__checkbox"
            :checked="selected.includes(tool.id)"
            :disabled="busy"
            @change="toggle(tool.id)"
          />
          <span class="wapri-install__text">
            <span class="wapri-install__name">
              {{ tool.label }}
              <code class="wapri-install__dir">{{ tool.dir }}/</code>
            </span>
            <span class="wapri-install__note">{{ tool.note }}</span>
          </span>
        </label>
      </li>
    </ul>

    <div class="wapri-install__foot">
      <button
        type="button"
        class="wapri-install__btn"
        :disabled="busy || !canWrite"
        :title="canWrite ? '' : '需要 Chrome / Edge，且页面在 HTTPS 或 localhost 下打开'"
        @click="install"
      >
        {{ busy ? '写入中…' : '添加到我的项目' }}
      </button>
      <span
        v-if="targets.length"
        class="wapri-install__hint"
      >
        选目录后写入
        <code>{{ targetHint }}</code>
      </span>
      <span
        v-else
        class="wapri-install__hint"
      >
        勾选工具后选择项目目录
      </span>
      <button
        v-if="status"
        type="button"
        class="wapri-install__reset"
        @click="reset"
      >
        重置
      </button>
    </div>

    <p
      v-if="status"
      class="wapri-install__status"
      :class="`is-${tone}`"
    >
      {{ status }}
    </p>

    <p
      v-if="!canWrite"
      class="wapri-install__fallback"
    >
      当前浏览器不支持目录写入（需 Chrome / Edge 等 Chromium 内核，且页面在 HTTPS 或 localhost
      下打开），可以手动下载后放到上表对应的目录：
      <a
        v-for="[file, label] in DOWNLOAD_FILES"
        :key="file"
        class="wapri-install__link"
        :href="fileUrl(file)"
        :download="file"
      >
        {{ label }}
      </a>
    </p>
  </div>
</template>

<style scoped>
.wapri-install {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  color: inherit;
  font-size: 13px;
  border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  border-radius: 12px;
}

.wapri-install__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wapri-install__title {
  font-size: 15px;
  font-weight: 600;
}

.wapri-install__sub {
  font-size: 12px;
  opacity: 0.62;
}

.wapri-install__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.wapri-install__item {
  border-radius: 8px;
  transition: background-color 0.15s;
}

.wapri-install__item:hover,
.wapri-install__item.is-checked {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}

.wapri-install__label {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 7px 8px;
  cursor: pointer;
}

.wapri-install__checkbox {
  margin: 2px 0 0;
  accent-color: #ea580c;
}

.wapri-install__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.wapri-install__name {
  font-weight: 500;
}

.wapri-install__dir {
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.55;
}

.wapri-install__note {
  font-size: 12px;
  opacity: 0.55;
}

.wapri-install__foot {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding-top: 4px;
  border-top: 1px dashed color-mix(in srgb, currentColor 12%, transparent);
}

.wapri-install__btn {
  padding: 6px 14px;
  color: #fff;
  font-size: 13px;
  background-image: linear-gradient(135deg, #ea580c, #f59e0b);
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.wapri-install__btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.wapri-install__hint {
  font-size: 12px;
  opacity: 0.62;
}

.wapri-install__hint code {
  font-size: 12px;
}

.wapri-install__reset {
  padding: 0;
  color: inherit;
  font-size: 12px;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.55;
}

.wapri-install__reset:hover {
  opacity: 0.85;
}

.wapri-install__status {
  margin: 0;
  font-size: 12px;
}

.wapri-install__status.is-ok {
  color: #15803d;
}

.wapri-install__status.is-error {
  color: #b91c1c;
}

.wapri-install__fallback {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  opacity: 0.75;
}

.wapri-install__link {
  margin-right: 8px;
  color: #ea580c;
}
</style>
