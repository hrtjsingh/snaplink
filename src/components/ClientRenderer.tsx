"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { patchExternalLinks } from "@/lib/external-links"
import { normalizePageCode } from "@/lib/page-code"
import {
  SNAPLINK_FOOTER_ATTR,
  extractBodyBlock,
  getThemeFromCss,
  readThemeFromElement,
  themeToStyle,
  type PageTheme,
} from "@/lib/snaplink-branding"
import { SnaplinkPageFooter } from "@/components/SnaplinkPageFooter"
import type { PageData } from "@/lib/types"

function mergeTheme(base: PageTheme, override: PageTheme): PageTheme {
  return {
    background: override.background || base.background,
    color: override.color || base.color,
  }
}

export default function ClientRenderer({ page }: { page: PageData }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const [resolvedTheme, setResolvedTheme] = useState<PageTheme>({})

  const { html, css, js } = useMemo(
    () => normalizePageCode(page.html || "", page.css || "", page.js || ""),
    [page.html, page.css, page.js]
  )

  const cssTheme = useMemo(() => getThemeFromCss(css), [css])
  const { bodyStyle, restCSS } = useMemo(() => extractBodyBlock(css), [css])

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
    const wrapper = wrapperRef.current
    const main = contentRef.current?.querySelector(".main-parent") as HTMLElement | null
    if (!wrapper || !main) return

    const sampled = readThemeFromElement(main)
    const next = mergeTheme(cssTheme, sampled)
    setResolvedTheme(next)

    wrapper.style.background = next.background || sampled.background || ""
    wrapper.style.color = next.color || sampled.color || ""
  }, [contentHtml, cssTheme])

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

  useEffect(() => {
    const wrapper = wrapperRef.current
    const main = contentRef.current?.querySelector(".main-parent") as HTMLElement | null
    if (!wrapper || !main) return

    const syncTheme = () => {
      const sampled = readThemeFromElement(main)
      const next = mergeTheme(cssTheme, sampled)
      setResolvedTheme(next)
      wrapper.style.background = next.background || sampled.background || ""
      wrapper.style.color = next.color || sampled.color || ""
    }

    syncTheme()

    const observer = new MutationObserver(syncTheme)
    observer.observe(main, {
      attributes: true,
      attributeFilter: ["style", "class"],
      subtree: true,
    })

    return () => observer.disconnect()
  }, [contentHtml, cssTheme])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a")
      if (!anchor || !root.contains(anchor)) return
      if (anchor.closest(`[${SNAPLINK_FOOTER_ATTR}]`)) return

      const href = anchor.getAttribute("href")?.trim()
      if (!href || href === "#" || href.startsWith("#") || href.startsWith("javascript:")) {
        return
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) return

      event.preventDefault()
      window.open(anchor.href, "_blank", "noopener,noreferrer")
    }

    root.addEventListener("click", handleClick, true)
    return () => root.removeEventListener("click", handleClick, true)
  }, [html])

  return (
    <div
      ref={wrapperRef}
      className="flex min-h-screen w-full flex-col"
      style={themeToStyle(resolvedTheme)}
    >
      <div ref={rootRef} className="w-full flex-1">
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
      <SnaplinkPageFooter />
    </div>
  )
}
