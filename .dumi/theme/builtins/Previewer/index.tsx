/**
 * 移动端 demo（iframe）预览框
 *
 * 外层容器、动作栏与主题色仍由 antd-style 主题的 Previewer 负责，这里只给 iframe demo 补两件事：
 * 1. 默认展开源码：把「代码在左、预览在右」的布局填满（样式见 index.css）；
 * 2. 包一层壳并量自身宽度：够宽加 `--split` 类名切左右分栏，不够宽保持上下结构。
 *
 * 宽度用 ResizeObserver 量，不用容器查询：`container-type` 会带来 layout containment，
 * 让动作栏 tooltip 的 position: fixed 以这个壳为参照物，提示框会跑到卡片顶部被挡住。
 *
 * 非 iframe demo 直接透传，行为与主题默认一致。
 */
import type { IPreviewerProps } from 'dumi/dist/client/theme-api/types'
import ThemePreviewer from 'dumi-theme-antd-style/dist/builtins/Previewer'
import { type FC, useEffect, useRef, useState } from 'react'

import './index.css'

/** 布局作用域：index.css 里的左右分栏样式只认这两个类名 */
const PREVIEWER_WRAPPER = 'wapri-mobile-demo'
const PREVIEWER_CLASS = 'wapri-mobile-previewer'
/** 内容区至少这么宽才左右分栏：375 手机 + 480 代码 + 两侧留白 */
const SPLIT_MIN_WIDTH = 960

const Previewer: FC<IPreviewerProps> = (props) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [split, setSplit] = useState(false)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || typeof ResizeObserver === 'undefined') {
      return undefined
    }

    const observer = new ResizeObserver((entries) => {
      setSplit(entries[0].contentRect.width >= SPLIT_MIN_WIDTH)
    })
    observer.observe(wrapper)

    return () => observer.disconnect()
  }, [])

  if (!props.iframe) {
    return <ThemePreviewer {...props} />
  }

  const className = [PREVIEWER_CLASS, props.className].filter(Boolean).join(' ')

  return (
    <div
      ref={wrapperRef}
      className={split ? `${PREVIEWER_WRAPPER} ${PREVIEWER_WRAPPER}--split` : PREVIEWER_WRAPPER}
    >
      <ThemePreviewer
        {...props}
        className={className}
        defaultShowCode={props.defaultShowCode ?? true}
      />
    </div>
  )
}

export default Previewer
