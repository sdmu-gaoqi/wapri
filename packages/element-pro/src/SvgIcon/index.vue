<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useAttrs, watch } from 'vue'
import { useConfig } from '../ConfigProvider/context'
import { getIconfontSymbol, loadIconfont, type IconfontSymbol } from './iconfont'

export interface SvgIconProps {
  /** Iconfont symbol 名称，可传 `card` 或完整的 `icon-card`。 */
  name: string
  /** 图标尺寸；数字单位为 px。 */
  size?: number | string
  /** 图标颜色；数组按 SVG path 顺序应用，最后一项会复用到其余 path。 */
  color?: string | string[]
  /**
   * 图标集脚本地址。不传时使用 `ConfigProvider` 注入的 `iconfont`；
   * 两者都没有时只读取页面内已存在的 `<symbol>`，不发起任何网络请求。
   */
  src?: string
}

const props = withDefaults(defineProps<SvgIconProps>(), {
  size: '1em',
})

defineOptions({ name: 'SvgIcon', inheritAttrs: false })

const attrs = useAttrs()
const { prefix, iconfont } = useConfig()
const iconRef = ref<SVGSVGElement>()
const iconSymbol = ref<IconfontSymbol>()
const originalFills = new WeakMap<SVGElement, string | null>()
const iconfontUrl = computed(() => props.src ?? iconfont.value)
const iconId = computed(() => (props.name.startsWith('icon-') ? props.name : `icon-${props.name}`))
const iconSize = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const colors = computed(() => (Array.isArray(props.color) ? props.color : props.color ? [props.color] : []))
const iconStyle = computed(() => ({
  width: iconSize.value,
  height: iconSize.value,
}))
const decorative = computed(() => attrs['aria-label'] === undefined && attrs.title === undefined)

function applyColors(): void {
  const paths = iconRef.value?.querySelectorAll<SVGElement>('path, circle, ellipse, polygon, polyline, rect')
  if (!paths) return

  paths.forEach((path, index) => {
    if (!originalFills.has(path)) originalFills.set(path, path.getAttribute('fill'))
    const color = colors.value[Math.min(index, colors.value.length - 1)]
    if (color) {
      path.setAttribute('fill', color)
      return
    }

    const originalFill = originalFills.get(path)
    if (originalFill === null) path.removeAttribute('fill')
    else if (originalFill !== undefined) path.setAttribute('fill', originalFill)
  })
}

async function renderSymbol(): Promise<void> {
  await nextTick()
  applyColors()
}

async function resolveIcon(): Promise<void> {
  iconSymbol.value = getIconfontSymbol(iconId.value)
  await renderSymbol()
}

async function loadIcon(): Promise<void> {
  try {
    if (iconfontUrl.value) await loadIconfont(iconfontUrl.value)

    // symbol 可能由图标集脚本异步注入，也可能由宿主直接写进页面，这里统一轮询等待
    for (let attempt = 0; attempt < 20 && !iconSymbol.value; attempt += 1) {
      await resolveIcon()
      if (!iconSymbol.value) await new Promise<void>((resolve) => window.setTimeout(resolve, 50))
    }
  } catch {
    iconSymbol.value = undefined
  }
}

watch([iconId, iconfontUrl], () => {
  void loadIcon()
})
watch(colors, () => {
  void nextTick(applyColors)
})

onMounted(() => {
  void loadIcon()
})
</script>

<template>
  <svg
    ref="iconRef"
    v-bind="$attrs"
    :class="`${prefix}-svg-icon`"
    :style="iconStyle"
    :viewBox="iconSymbol?.viewBox"
    :aria-hidden="decorative ? 'true' : undefined"
    :role="decorative ? undefined : 'img'"
    :innerHTML="iconSymbol?.content"
  />
</template>

<style scoped>
[class*='-svg-icon'] {
  display: inline-block;
  flex: 0 0 auto;
  fill: currentColor;
  overflow: hidden;
  vertical-align: -0.125em;
}
</style>
