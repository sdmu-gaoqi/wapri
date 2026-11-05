import { ref, onMounted, onUnmounted, type Ref } from 'vue'

const isClient = typeof window !== 'undefined'

const innerHeight = () => {
  return window.innerHeight
}

export const useVh100 = (): Ref<number> => {
  const height = ref(isClient ? innerHeight() : 0)

  const setMeasuredHeight = () => {
    height.value = innerHeight()
  }

  onMounted(() => {
    if (!isClient) return
    window.addEventListener('resize', setMeasuredHeight)
  })

  onUnmounted(() => {
    if (!isClient) return
    window.removeEventListener('resize', setMeasuredHeight)
  })

  return height
}
