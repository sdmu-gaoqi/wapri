/**
 * 自定义 DocLayout
 *
 * 作用：在 page frontmatter 中声明 `hideChrome: true` 时，
 * 跳过 dumi 默认 DocLayout 中的 Header / Sidebar / Footer / Toc 等外壳，
 * 直接渲染页面正文，常用于「全屏落地页」类自定义页面（如 /projects）。
 *
 * 其他路由不受影响，会完整走 antd-style 的 DocLayout。
 */
import { useOutlet, useRouteMeta } from 'dumi'
import { type FC, type ReactElement } from 'react'
import AntdStyleDocLayout from 'dumi-theme-antd-style/dist/layouts/DocLayout'

const DocLayout: FC = () => {
  const { frontmatter } = useRouteMeta()
  const outlet: ReactElement | null = useOutlet()

  // 通过 frontmatter 关闭整页 chrome
  if (frontmatter?.hideChrome) {
    return <>{outlet}</>
  }

  return <AntdStyleDocLayout />
}

export default DocLayout
