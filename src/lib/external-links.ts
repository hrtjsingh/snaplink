/** Open external/same-page navigational links in a new tab (skip # anchors). */
export function patchExternalLinks(root: ParentNode) {
  if (typeof document === 'undefined') return

  root.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href')?.trim()
    if (!href || href === '#' || href.startsWith('#') || href.startsWith('javascript:')) {
      return
    }
    anchor.setAttribute('target', '_blank')
    anchor.setAttribute('rel', 'noopener noreferrer')
  })
}

export const externalLinkHandlerScript = `(function () {
  document.addEventListener(
    'click',
    function (e) {
      var anchor = e.target.closest('a')
      if (!anchor) return
      var href = anchor.getAttribute('href')
      if (!href || href === '#' || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
      e.preventDefault()
      window.open(anchor.href, '_blank', 'noopener,noreferrer')
    },
    true
  )
})()`
