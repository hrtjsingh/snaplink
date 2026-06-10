"use client"

import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { patchExternalLinks } from "@/lib/external-links"
import { normalizePageCode } from "@/lib/page-code"
import type { PageData } from "@/lib/types"

function extractBodyCSS(css: string) {
  if (!css) return { bodyStyle: "", restCSS: "" }

  let bodyStyle = ""
  let restCSS = css

  const bodyRegex = /body\s*\{([\s\S]*?)\}/gi

  restCSS = restCSS.replace(bodyRegex, (_, styles) => {
    bodyStyle += styles
    return ""
  })

  return { bodyStyle, restCSS }
}

export default function ClientRenderer({ page }: { page: PageData }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  const { html, css, js } = useMemo(
    () => normalizePageCode(page.html || "", page.css || "", page.js || ""),
    [page.html, page.css, page.js]
  )

  const { bodyStyle, restCSS } = useMemo(() => extractBodyCSS(css), [css])

  const contentHtml = useMemo(
    () => `
      <style>${restCSS}</style>
      <div class="main-parent"${bodyStyle ? ` style="${bodyStyle.replace(/"/g, "&quot;")}"` : ""}>
        ${html}
      </div>
    `,
    [html, restCSS, bodyStyle]
  )

  useLayoutEffect(() => {
    scriptRef.current?.remove()
    scriptRef.current = null

    if (js.trim()) {
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.text = js
      script.dataset.snaplinkPageScript = "true"
      document.body.appendChild(script)
      scriptRef.current = script
    }

    const content = contentRef.current
    if (content) patchExternalLinks(content)

    return () => {
      scriptRef.current?.remove()
      scriptRef.current = null
    }
  }, [js, html])

  // Catch links added dynamically after user scripts run
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a')
      if (!anchor || !root.contains(anchor)) return

      const href = anchor.getAttribute('href')?.trim()
      if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:')) {
        return
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return

      event.preventDefault()
      window.open(anchor.href, '_blank', 'noopener,noreferrer')
    }

    root.addEventListener('click', handleClick, true)
    return () => root.removeEventListener('click', handleClick, true)
  }, [html])

  return (
    <div ref={rootRef} style={{ width: "100%", minHeight: "100vh" }}>
      <div ref={contentRef} dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </div>
  )
}
