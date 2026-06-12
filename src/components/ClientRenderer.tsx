"use client"

import { useMemo } from "react"
import { normalizePageCode } from "@/lib/page-code"
import { buildUserPageDocument } from "@/lib/page-document"
import { getIframeSandbox } from "@/lib/sandbox-iframe"
import { getThemeFromCss, themeToStyle } from "@/lib/snaplink-branding"
import { SnaplinkPageFooter } from "@/components/SnaplinkPageFooter"
import type { PageData } from "@/lib/types"

export default function ClientRenderer({
  page,
  persistentStorage = false,
}: {
  page: PageData
  persistentStorage?: boolean
}) {
  const { html, css, js } = useMemo(
    () => normalizePageCode(page.html || "", page.css || "", page.js || ""),
    [page.html, page.css, page.js]
  )

  const pageDocument = useMemo(
    () =>
      buildUserPageDocument({
        title: page.title,
        description: page.description,
        html,
        css,
        js,
      }),
    [page.title, page.description, html, css, js]
  )

  const shellTheme = useMemo(() => themeToStyle(getThemeFromCss(css)), [css])
  const sandbox = getIframeSandbox(persistentStorage)

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={shellTheme}
    >
      <iframe
        title={page.title || "Published page"}
        sandbox={sandbox}
        srcDoc={pageDocument}
        className="w-full flex-1 min-h-[calc(100vh-4rem)] border-0 bg-transparent"
        referrerPolicy="no-referrer"
      />
      <SnaplinkPageFooter />
    </div>
  )
}
