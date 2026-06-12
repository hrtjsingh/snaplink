import {
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
  getConfiguredSiteUrl,
} from '@/lib/app-seo'

export function AppJsonLd() {
  const siteUrl = getConfiguredSiteUrl()
  const schemas = [
    buildWebSiteJsonLd(siteUrl),
    buildOrganizationJsonLd(siteUrl),
    buildSoftwareApplicationJsonLd(siteUrl),
  ]

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema['@type'] as string}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
