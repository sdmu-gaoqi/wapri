type Status = 'loading' | 'ready' | 'error'
type LoadProps = Record<string, any>

function loadElement<T extends HTMLElement>(
  selector: string,
  createElement: () => T,
  props: LoadProps,
  remove: boolean,
  parent: HTMLElement,
) {
  return new Promise<Status>((resolve, reject) => {
    const el: T | null = document.querySelector(selector)
    if (!el) {
      const newEl = createElement()
      Object.keys(props).forEach((key) => {
        // @ts-ignore
        newEl[key] = props[key]
      })
      newEl.setAttribute('data-loaded', 'loading')
      parent.appendChild(newEl)

      newEl.addEventListener('load', () => {
        newEl.setAttribute('data-loaded', 'ready')
        resolve('ready')
        if (remove) {
          parent.removeChild(newEl)
        }
      })

      newEl.addEventListener('error', () => {
        newEl.setAttribute('data-loaded', 'error')
        reject('error')
        if (remove) {
          parent.removeChild(newEl)
        }
      })
    } else {
      if (el.getAttribute('data-loaded') === 'ready') {
        resolve('ready')
        return
      }
      el.addEventListener('load', () => {
        resolve('ready')
      })
      el.addEventListener('error', () => {
        resolve('error')
      })
    }
  })
}

const loadScript = (path: string, props: LoadProps, remove: boolean) => {
  return loadElement<HTMLScriptElement>(
    `script[src="${path}"][data-loaded]`,
    () => {
      const script = document.createElement('script')
      script.src = path
      return script
    },
    props,
    remove,
    document.body,
  )
}

const loadCss = (path: string, props: LoadProps, remove: boolean) => {
  return loadElement<HTMLLinkElement>(
    `link[href="${path}"][data-loaded]`,
    () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = path
      // IE9+
      const isLegacyIECss = 'hideFocus' in link
      // use preload in IE Edge (to detect load errors)
      if (isLegacyIECss && link.relList) {
        link.rel = 'preload'
        // @ts-ignore
        link.as = 'style'
      }
      return link
    },
    props,
    remove,
    document.head,
  )
}

// 默认判断为js,仅后缀是.css的才认为是css
export const loadResource = (path: string, props: LoadProps = {}, remove = false) => {
  if (!path) {
    return Promise.resolve()
  }
  const pathname = path.replace(/[|#].*$/, '')
  if (/(^css!|\.css$)/.test(pathname)) {
    return loadCss(path, props || {}, remove)
  } else {
    return loadScript(path, props || {}, remove)
  }
}
