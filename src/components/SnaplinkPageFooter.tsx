import Link from 'next/link'
import { SNAPLINK_FOOTER_ATTR, snaplinkFooterCss } from '@/lib/snaplink-branding'

export function SnaplinkPageFooter() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: snaplinkFooterCss }} />
      <footer
      className="snaplink-built-with-footer flex shrink-0 justify-center items-center px-4 py-3"
      {...{ [SNAPLINK_FOOTER_ATTR]: 'true' }}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-[13px] no-underline"
        {...{ [SNAPLINK_FOOTER_ATTR]: 'true' }}
      >
        Built with{' '}
        <span className="snaplink-brand font-bold">Snaplink</span>
      </Link>
    </footer>
    </>
  )
}
