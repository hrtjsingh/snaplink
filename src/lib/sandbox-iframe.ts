/** Base sandbox flags — always omit allow-same-origin unless persistent storage is enabled. */
export const SANDBOX_BASE =
  'allow-scripts allow-popups allow-popups-to-escape-sandbox'

/** With allow-same-origin, localStorage persists for the iframe origin (use on isolated user-pages domain). */
export const SANDBOX_WITH_STORAGE = `${SANDBOX_BASE} allow-same-origin`

export function getIframeSandbox(persistentStorage: boolean): string {
  return persistentStorage ? SANDBOX_WITH_STORAGE : SANDBOX_BASE
}

/**
 * Enable real localStorage when user pages are on a dedicated origin (production)
 * or during local development.
 */
export function shouldAllowPersistentUserStorage(): boolean {
  if (process.env.USER_PAGES_ORIGIN?.trim()) return true
  return process.env.NODE_ENV === 'development'
}
