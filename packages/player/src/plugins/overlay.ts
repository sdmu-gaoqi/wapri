import {
  defaultOverlayOpacity,
  defaultOverlayWidth,
  defaultOverlayX,
  defaultOverlayY,
  overlayClassName,
  overlayEmptyText,
  overlayLabel,
  overlayMaxWidth,
  overlayMinWidth,
  overlayOpacityText,
  overlayResetText,
  overlayWidthText,
} from '../constant'
import { overlayIcon } from '../constant/icons'
import { ensureOverlayStyle } from '../core/style'
import type { OverlayConfig, PluginDefinition } from '../types/plugin'
import type { SettingOption } from 'artplayer'

/** 拖拽时把位置限制在容器内 */
const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

export const overlayPlugin: PluginDefinition<OverlayConfig> = {
  key: 'overlay',
  label: overlayLabel,
  defaultConfig: {
    src: '',
    type: 'image',
    x: defaultOverlayX,
    y: defaultOverlayY,
    width: defaultOverlayWidth,
    opacity: defaultOverlayOpacity,
    draggable: true,
    loop: true,
  },
  install({ art, setting, onCleanup }, config) {
    ensureOverlayStyle()

    let node: HTMLDivElement | undefined
    let switchItem: SettingOption | undefined
    let position = { x: config.x, y: config.y }
    let width = config.width
    let opacity = config.opacity

    const applyStyle = () => {
      if (!node) return

      node.style.left = `${position.x}%`
      node.style.top = `${position.y}%`
      node.style.width = `${width}%`
      node.style.opacity = String(opacity)
    }

    const bindDrag = (element: HTMLDivElement) => {
      let moveHandler: ((event: PointerEvent) => void) | undefined
      let upHandler: (() => void) | undefined

      const stopDrag = () => {
        if (moveHandler) window.removeEventListener('pointermove', moveHandler)
        if (upHandler) window.removeEventListener('pointerup', upHandler)

        moveHandler = undefined
        upHandler = undefined
      }

      const handlePointerDown = (event: PointerEvent) => {
        event.preventDefault()
        event.stopPropagation()

        const rect = art.template.$player.getBoundingClientRect()

        moveHandler = (moveEvent: PointerEvent) => {
          position = {
            x: clampPercent(((moveEvent.clientX - rect.left) / rect.width) * 100),
            y: clampPercent(((moveEvent.clientY - rect.top) / rect.height) * 100),
          }

          applyStyle()
        }

        upHandler = stopDrag
        window.addEventListener('pointermove', moveHandler)
        window.addEventListener('pointerup', upHandler)
      }

      element.addEventListener('pointerdown', handlePointerDown)

      onCleanup(() => {
        element.removeEventListener('pointerdown', handlePointerDown)
        stopDrag()
      })
    }

    const create = () => {
      if (node) return

      if (!config.src) {
        art.notice.show = overlayEmptyText

        return
      }

      const element = document.createElement('div')

      element.className = config.draggable ? `${overlayClassName} ${overlayClassName}--draggable` : overlayClassName

      if (config.type === 'video') {
        const video = document.createElement('video')

        video.src = config.src
        video.muted = true
        video.loop = config.loop
        video.autoplay = true
        video.playsInline = true
        void video.play().catch(() => undefined)
        element.appendChild(video)
      } else {
        const image = document.createElement('img')

        image.src = config.src
        image.alt = ''
        element.appendChild(image)
      }

      art.template.$player.appendChild(element)
      node = element

      applyStyle()

      if (config.draggable) bindDrag(element)
    }

    const remove = () => {
      node?.remove()
      node = undefined
    }

    switchItem = setting({
      html: overlayLabel,
      icon: overlayIcon,
      switch: Boolean(config.src),
      onSwitch: (item) => {
        const next = !item.switch

        if (next) create()
        else remove()

        return next
      },
    })

    setting({
      html: overlayOpacityText,
      icon: overlayIcon,
      range: [opacity, 0, 1, 0.05],
      onChange: (item) => {
        opacity = Number(item.$range?.value ?? opacity)
        applyStyle()

        return `${Math.round(opacity * 100)}%`
      },
    })

    setting({
      html: overlayWidthText,
      icon: overlayIcon,
      range: [width, overlayMinWidth, overlayMaxWidth, 1],
      onChange: (item) => {
        width = Number(item.$range?.value ?? width)
        applyStyle()

        return `${width}%`
      },
    })

    setting({
      html: overlayResetText,
      icon: overlayIcon,
      onClick: () => {
        position = { x: config.x, y: config.y }
        applyStyle()

        return ''
      },
    })

    if (switchItem.switch) create()

    onCleanup(remove)
  },
}
