/**
 * title: 组件库
 * description: 前端 JS SDK 共仓，覆盖组件库、Hooks、工具函数、文件预览与 App 桥接
 * keywords: [SDK, element-pro, preview, hooks, utils, jsbridge, lint]
 * sidebar: false
 * toc: false
 * hideChrome: true
 */
import React from 'react'

import { Link, useSiteData } from 'dumi'

import './index.css'

/** 全部分类，选中时不做分类过滤 */
const ALL_CATEGORY = '全部'

/** 项目分类的展示顺序 */
const CATEGORY_ORDER = ['组件库', 'Hooks 与工具', '文件预览', '网络与通信', '工程化']

type ProjectCategory = (typeof CATEGORY_ORDER)[number]

type ProjectItem = {
  /** 项目名（卡片标题） */
  name: string
  /** npm 包名 */
  packageName: string
  /** 项目分类 */
  category: ProjectCategory
  /** 主要技术栈 */
  tech: string
  /** 一句话介绍 */
  description: string
  /** 能力亮点 */
  highlights: string[]
  /** 图标文案 */
  mark: string
  /** 图标渐变起止色 */
  accent: [string, string]
  /** 站内文档地址 */
  docPath?: string
  /** 站外文档地址 */
  link?: string
}

/** 项目数据取自各包的 package.json 与文档 */
const PROJECTS: ProjectItem[] = [
  {
    name: 'element-pro',
    packageName: '@wapri/element-pro',
    category: '组件库',
    tech: 'Vue 3 · TypeScript',
    description:
      '面向中后台场景的 Vue 3 组件库，沉淀了 CheckCard、ProTable、DrawerForm、TagSelector、Ellipsis 等高频组件，同时支持模板与 TSX 两种写法。',
    highlights: [],
    mark: 'ui',
    accent: ['#d97706', '#f59e0b'],
    docPath: '/element-pros',
  },
  {
    name: 'hooks',
    packageName: '@wapri/ghooks',
    category: 'Hooks 与工具',
    tech: 'Vue 3',
    description: 'Vue 3 Hooks 集合，内置导出 vue-hooks-plus，涵盖横竖屏判断、视口高度等场景。',
    highlights: ['内置 vue-hooks-plus'],
    mark: 'hk',
    accent: ['#ea580c', '#f97316'],
    docPath: '/hooks',
  },
  {
    name: 'utils',
    packageName: '@wapri/gutils',
    category: 'Hooks 与工具',
    tech: 'TypeScript',
    description: '前端通用函数库，内置导出 lodash-es 与 dayjs，提供鉴权、货币、URL、JSON、事件总线、本地存储等模块。',
    highlights: ['内置 lodash-es'],
    mark: 'ut',
    accent: ['#b45309', '#d97706'],
    docPath: '/utils',
  },
  {
    name: 'preview',
    packageName: '@wapri/preview',
    category: '文件预览',
    tech: 'TypeScript · Canvas',
    description: 'H5 文件预览包，支持文本、PDF、Word、XLSX，解析与渲染分离，正文与缩略图都只渲染可视区域。',
    highlights: ['按可视区域懒渲染', 'PDF / Word / XLSX'],
    mark: 'pv',
    accent: ['#9f1239', '#f43f5e'],
    docPath: '/previews',
  },
  {
    name: 'jsbridge',
    packageName: '@wapri/gjsbridge',
    category: '网络与通信',
    tech: 'app',
    description: 'App WebView JSBridge 封装，统一三端调用协议，提供 canIUse、拨打电话、获取安全区、关闭页面等能力。',
    highlights: ['三端统一协议', '能力探测 canIUse'],
    mark: 'jb',
    accent: ['#b91c1c', '#dc2626'],
    docPath: '/jsbridges',
  },
]

/** 搜索图标 */
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7.25 12.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Zm3.72-.78 3.03 3.03"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
)

/** 清空图标 */
const CloseIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 1l8 8M9 1l-8 8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
)

/** 箭头图标 */
const ArrowIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 9l6-6M4.5 3H9v4.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * 项目总览页
 *
 * 深色首屏 + 关键词搜索 + 分类筛选 + 项目卡片栅格。
 */
const ProjectsPage: React.FC = () => {
  const { themeConfig } = useSiteData()
  const [keyword, setKeyword] = React.useState('')
  const [category, setCategory] = React.useState<string>(ALL_CATEGORY)

  /** 分类及其项目数量 */
  const categories = React.useMemo(() => {
    const counter = new Map<string, number>()
    PROJECTS.forEach((item) => {
      counter.set(item.category, (counter.get(item.category) ?? 0) + 1)
    })

    return [
      { name: ALL_CATEGORY, count: PROJECTS.length },
      ...CATEGORY_ORDER.map((name) => ({ name, count: counter.get(name) ?? 0 })),
    ]
  }, [])

  /** 分类 + 关键词过滤后的项目列表 */
  const list = React.useMemo(() => {
    const searchKey = keyword.trim().toLowerCase()

    return PROJECTS.filter((item) => {
      if (category !== ALL_CATEGORY && item.category !== category) return false
      if (!searchKey) return true

      return [item.name, item.packageName, item.description, item.category, item.tech, ...item.highlights]
        .join(' ')
        .toLowerCase()
        .includes(searchKey)
    })
  }, [keyword, category])

  const logo = themeConfig.logo
  const resetFilter = () => {
    setKeyword('')
    setCategory(ALL_CATEGORY)
  }

  /**
   * 卡片聚光：把鼠标相对卡片的坐标写入 CSS 变量，
   * 由 .wa-projects__card 的 radial-gradient 读取，让光斑跟着鼠标走。
   * 直接写 inline style，避免走 React state 引发整页重渲染。
   */
  const handleCardPointerMove = (event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()

    el.style.setProperty('--kp-mx', `${event.clientX - rect.left}px`)
    el.style.setProperty('--kp-my', `${event.clientY - rect.top}px`)
  }

  /** 鼠标移出时清除坐标，光斑回到默认的居中位置 */
  const handleCardPointerLeave = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.style.removeProperty('--kp-mx')
    event.currentTarget.style.removeProperty('--kp-my')
  }

  return (
    <div className="wa-projects">
      <header className="wa-projects__hero">
        <div className="wa-projects__hero-main">
          <p className="wa-projects__eyebrow">wa · Monorepo</p>
          <h1 className="wa-projects__title">前端 SDK</h1>
          <p className="wa-projects__subtitle">
            前端 JS SDK 共仓下的能力包，覆盖 Vue 3 组件库、Hooks、工具函数、文件预览与 App 桥接， 全部由 pnpm workspace
            管理并独立发包。
          </p>
          <div>
            <Link
              to="/guide"
              style={{ textDecoration: 'none', color: 'var(--kp-text-note)' }}
            >
              查看指南
            </Link>
          </div>
        </div>
        <div className="wa-projects__hero-meta">
          {typeof logo === 'string' ? (
            <img
              className="wa-projects__logo"
              src={logo}
              alt="logo"
            />
          ) : (
            <span className="wa-projects__logo wa-projects__logo--text">wa</span>
          )}
        </div>
      </header>

      <div className="wa-projects__toolbar">
        <label className="wa-projects__search">
          <SearchIcon />
          <input
            className="wa-projects__search-input"
            value={keyword}
            placeholder="搜索项目名称、包名、描述或标签"
            aria-label="搜索项目"
            onChange={(event) => setKeyword(event.target.value)}
          />
          {keyword ? (
            <button
              type="button"
              className="wa-projects__search-clear"
              aria-label="清空搜索"
              onClick={() => setKeyword('')}
            >
              <CloseIcon />
            </button>
          ) : null}
        </label>
      </div>

      <nav
        className="wa-projects__filters"
        aria-label="项目分类"
      >
        {categories.map((item) => {
          const active = item.name === category

          return (
            <button
              key={item.name}
              type="button"
              className={`wa-projects__filter${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => setCategory(item.name)}
            >
              {item.name}
              <span className="wa-projects__filter-count">{item.count}</span>
            </button>
          )
        })}
      </nav>

      <p className="wa-projects__result">
        共 <strong>{list.length}</strong> 个项目
        {category === ALL_CATEGORY ? null : ` · 分类「${category}」`}
        {keyword.trim() ? ` · 关键词「${keyword.trim()}」` : ''}
      </p>

      {list.length ? (
        <div className="wa-projects__grid">
          {list.map((item) => (
            <article
              className="wa-projects__card"
              key={item.packageName}
              onMouseMove={handleCardPointerMove}
              onMouseLeave={handleCardPointerLeave}
            >
              <div className="wa-projects__card-head">
                <span
                  className="wa-projects__card-mark"
                  style={{ backgroundImage: `linear-gradient(135deg, ${item.accent[0]} 0%, ${item.accent[1]} 100%)` }}
                >
                  {item.mark}
                </span>
                <div className="wa-projects__card-heading">
                  <h3 className="wa-projects__card-title">{item.name}</h3>
                </div>
              </div>

              <p className="wa-projects__card-package">{item.packageName}</p>
              <p className="wa-projects__card-desc">{item.description}</p>

              <ul className="wa-projects__card-highlights">
                {item.highlights.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>

              <div className="wa-projects__card-foot">
                <div className="wa-projects__tags">
                  <span className="wa-projects__tag">{item.category}</span>
                  <span className="wa-projects__tag">{item.tech}</span>
                </div>
                {item.docPath ? (
                  <Link
                    className="wa-projects__card-link"
                    to={item.docPath}
                  >
                    文档
                    <ArrowIcon />
                  </Link>
                ) : null}
                {item.link ? (
                  <a
                    className="wa-projects__card-link"
                    href={item.link}
                    target="_blank"
                  >
                    文档
                    <ArrowIcon />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="wa-projects__empty">
          <p className="wa-projects__empty-title">没有找到匹配的项目</p>
          <p className="wa-projects__empty-desc">试试更换关键词，或切换到其他分类。</p>
          <button
            type="button"
            className="wa-projects__primary-btn"
            onClick={resetFilter}
          >
            重置筛选
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
