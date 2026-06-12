import { normalizePageCode } from '@/lib/page-code'
import { buildWebPageJsonLd } from '@/lib/page-seo'
import { sanitizeHTML } from '@/lib/sanitize'

interface SeoPageContentProps {
  title: string
  description?: string
  html: string
  css?: string
  js?: string
  canonicalUrl: string
  updatedAt?: Date
}

/**
 * Server-rendered crawlable content for search engines. The interactive page
 * renders in a sandboxed iframe; this provides indexable HTML in the document.
 */
export function SeoPageContent({
  title,
  description,
  html,
  css = '',
  js = '',
  canonicalUrl,
  updatedAt,
}: SeoPageContentProps) {
  const normalized = normalizePageCode(html, css, js)
  const safeHtml = sanitizeHTML(normalized.html)
  const metaDescription = description?.trim()

  const jsonLd = buildWebPageJsonLd({
    title,
    description: metaDescription,
    url: canonicalUrl,
    dateModified: updatedAt,
  })

  if (!safeHtml && !metaDescription) return null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article
        className="sr-only"
        aria-label={title}
        data-snaplink-seo="true"
      >
        <h1>{title}</h1>
        {metaDescription ? <p>{metaDescription}</p> : null}
        {safeHtml ? (
          <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
        ) : null}
      </article>
      <noscript>
        <article className="p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">{title}</h1>
          {metaDescription ? (
            <p className="text-zinc-400 mb-6">{metaDescription}</p>
          ) : null}
          {safeHtml ? (
            <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
          ) : null}
        </article>
      </noscript>
    </>
  )
}
