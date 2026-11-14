<template>
  <div
    ref="containerRef"
    :class="prefix"
    :style="rootStyle"
  ></div>
</template>

<script setup lang="ts">
import Artplayer from 'artplayer'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { defaultPlayerRatio, prefix } from '../constant'
import { resolveOption } from '../core/option'
import { createPluginRunner, resolvePlugins } from '../core/registry'
import type { FlipMode } from '../types/plugin'
import type { VideoPlayerEmits, VideoPlayerInstance, VideoPlayerProps } from '../types/player'

defineOptions({ name: 'VideoPlayer' })

const props = withDefaults(defineProps<VideoPlayerProps>(), {
  plugins: () => [],
  options: () => ({}),
})

const emit = defineEmits<VideoPlayerEmits>()

const containerRef = ref<HTMLDivElement>()
const player = shallowRef<Artplayer>()

/** 插件的清理回调，重建与卸载时先于实例销毁执行 */
let disposePlugins: (() => void) | undefined

const rootStyle = computed<CSSProperties>(() => ({
  position: 'relative',
  width: '100%',
  background: '#000',
  ...(props.height === undefined
    ? { aspectRatio: defaultPlayerRatio }
    : { height: typeof props.height === 'number' ? `${props.height}px` : props.height }),
}))

const bindEvents = (art: Artplayer) => {
  art.on('play', () => emit('play'))
  art.on('pause', () => emit('pause'))
  art.on('seek', (currentTime, time) => emit('seek', currentTime, time))
  art.on('flip', (mode) => emit('flip', mode as FlipMode))
  art.on('pip', (state) => emit('pip', state))
  art.on('screenshot', (dataUri) => emit('screenshot', dataUri))
  art.on('fullscreen', (state) => emit('fullscreen', state))
  art.on('fullscreenWeb', (state) => emit('fullscreen-web', state))
  art.on('error', (error, reconnectTime) => emit('error', error, reconnectTime))
  art.on('destroy', () => emit('destroy'))
  // artplayer 只在 video 原生事件上带前缀，这里补成语义化的事件名
  art.on('video:ended', () => emit('ended'))
  art.on('video:timeupdate', () => emit('timeupdate'))
  art.on('video:volumechange', () => emit('volumechange'))
  art.on('video:ratechange', () => emit('ratechange'))
}

const create = (restore?: { currentTime: number; playing: boolean }) => {
  const container = containerRef.value

  if (!container || !props.url) return

  const runner = createPluginRunner(resolvePlugins(props.plugins))

  disposePlugins = runner.dispose

  const art = new Artplayer(resolveOption(props, container, runner.plugins), (readyArt) => {
    // 插件变更触发的重建，把进度和播放状态接上
    if (restore?.currentTime) readyArt.currentTime = restore.currentTime
    if (restore?.playing) void readyArt.play().catch(() => undefined)

    emit('ready')
  })

  player.value = art
  bindEvents(art)
}

const destroy = () => {
  disposePlugins?.()
  disposePlugins = undefined
  // 默认参数会清空容器，重建时不会残留上一个实例的 DOM
  player.value?.destroy()
  player.value = undefined
}

const rebuild = () => {
  const currentTime = player.value?.currentTime ?? 0
  const playing = player.value?.playing ?? false

  destroy()
  create({ currentTime, playing })
}

watch(
  () => props.url,
  (url) => {
    if (!player.value) {
      create()
      return
    }

    if (url) player.value.url = url
  },
)

watch(() => [props.plugins, props.options], rebuild, { deep: true })

watch(
  () => props.poster,
  (poster) => {
    if (player.value && poster) player.value.poster = poster
  },
)

watch(
  () => props.theme,
  (theme) => {
    if (player.value && theme) player.value.theme = theme
  },
)

watch(
  () => props.volume,
  (volume) => {
    if (player.value && volume !== undefined) player.value.volume = volume
  },
)

watch(
  () => props.muted,
  (muted) => {
    if (player.value && muted !== undefined) player.value.muted = muted
  },
)

watch(
  () => props.loop,
  (loop) => {
    if (player.value && loop !== undefined) player.value.video.loop = loop
  },
)

onMounted(create)
onBeforeUnmount(destroy)

const instance: VideoPlayerInstance = {
  get player() {
    return player.value
  },
  play: () => player.value?.play(),
  pause: () => player.value?.pause(),
  toggle: () => player.value?.toggle(),
  seek: (time: number) => {
    if (player.value) player.value.currentTime = time
  },
  screenshot: (name?: string) => player.value?.screenshot(name),
  fullscreen: (state?: boolean) => {
    if (!player.value) return

    player.value.fullscreen = state ?? !player.value.fullscreen
  },
}

defineExpose(instance)
</script>
