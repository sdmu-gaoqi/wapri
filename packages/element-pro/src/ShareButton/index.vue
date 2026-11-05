<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ElButton } from 'element-plus'
import { copy, os } from '@wapri/gutils'
import { useConfig } from '../ConfigProvider/context'
import { parseGuideStep } from './steps'
import type { ShareButtonProps } from './types'
import './styles/index.scss'

const props = withDefaults(defineProps<ShareButtonProps>(), {
  text: '分享',
  disabled: false,
  forceGuide: false,
  guideTitle: '微信内无法直接唤起 App',
  showArrow: true,
  guideSteps: () => ['点右上角 **···**', '选择 **在浏览器中打开**', '在 **Safari/Chrome** 中即可正常拉起'],
  actionText: '复制链接，到浏览器打开',
})

const emit = defineEmits<{
  share: [link: string]
  copy: [link: string]
}>()

// 组件包含 ElButton 与 Teleport 两个根节点，需手动把透传属性交给按钮
defineOptions({ name: 'ShareButton', inheritAttrs: false })

const { prefix } = useConfig()
const base = computed(() => `${prefix.value}-share-button`)

const guideVisible = ref(false)
/** 复制结果：true 成功，false 失败（微信内 Clipboard API 常静默失败，需要文案兜底引导手动复制） */
const copyResult = ref<boolean | null>(null)
let prevBodyOverflow = ''

/** 微信内置浏览器会拦截 App Scheme 唤起，改为引导用户「到浏览器打开」 */
const shouldGuide = () => props.forceGuide || os.isWeixin()

const statusText = computed(() => {
  if (copyResult.value === true) return '已复制，请到浏览器打开'
  if (copyResult.value === false) return '复制失败，请手动复制地址栏链接'
  return ''
})

function lockBodyScroll() {
  if (typeof document === 'undefined') return
  prevBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return
  document.body.style.overflow = prevBodyOverflow
}

/** 复制链接并记录结果，微信内失败时提示手动复制 */
function copyLink() {
  try {
    copyResult.value = Boolean(copy(props.link))
  } catch {
    copyResult.value = false
  }
}

function openGuide() {
  guideVisible.value = true
  lockBodyScroll()
  // 打开即尝试复制一次，省去用户手动点按钮；失败也有文案兜底
  copyLink()
}

function closeGuide() {
  guideVisible.value = false
  copyResult.value = null
  unlockBodyScroll()
}

function handleClick() {
  if (props.disabled) return
  emit('share', props.link)
  if (shouldGuide()) {
    openGuide()
    return
  }
  window.location.href = props.link
}

function handleCopy() {
  copyLink()
  if (copyResult.value) emit('copy', props.link)
}

onBeforeUnmount(() => {
  unlockBodyScroll()
})
</script>

<template>
  <ElButton
    v-bind="$attrs"
    :class="base"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot>{{ text }}</slot>
  </ElButton>

  <Teleport to="body">
    <Transition :name="`${base}-fade`">
      <div
        v-if="guideVisible"
        :class="`${base}__mask`"
        @click="closeGuide"
      >
        <span
          v-if="showArrow"
          :class="`${base}__arrow`"
          aria-hidden="true"
        >
          <svg viewBox="0 0 40 40">
            <path d="M8 32 30 10" />
            <path d="M19 10h11v11" />
          </svg>
        </span>
        <div :class="`${base}__content`">
          <div :class="`${base}__title`">{{ guideTitle }}</div>
          <ol :class="`${base}__steps`">
            <li
              v-for="(step, index) in guideSteps"
              :key="index"
              :class="`${base}__step`"
            >
              <template
                v-for="(segment, segIndex) in parseGuideStep(step)"
                :key="segIndex"
              >
                <strong v-if="segment.bold">{{ segment.text }}</strong>
                <template v-else>{{ segment.text }}</template>
              </template>
            </li>
          </ol>
          <p
            v-if="statusText"
            :class="`${base}__status`"
          >
            {{ statusText }}
          </p>
        </div>
        <div :class="`${base}__footer`">
          <ElButton
            type="primary"
            size="large"
            :class="`${base}__action`"
            @click.stop="handleCopy"
          >
            {{ actionText }}
          </ElButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
