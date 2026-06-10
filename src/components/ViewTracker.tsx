'use client'

import { useEffect, useRef } from 'react'

const HEARTBEAT_MS = 15_000

export default function ViewTracker({ slug }: { slug: string }) {
  const viewIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const sentRef = useRef(false)

  useEffect(() => {
    startTimeRef.current = Date.now()
    sentRef.current = false

    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.viewId) viewIdRef.current = data.viewId
      })
      .catch(() => {})

    const sendDuration = () => {
      if (sentRef.current || !viewIdRef.current) return
      sentRef.current = true

      const durationMs = Date.now() - startTimeRef.current
      const payload = JSON.stringify({ viewId: viewIdRef.current, durationMs })

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/view', blob)
        return
      }

      fetch('/api/analytics/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }

    const onHide = () => {
      if (document.visibilityState === 'hidden') sendDuration()
    }

    const heartbeat = setInterval(() => {
      if (!viewIdRef.current || sentRef.current) return
      const durationMs = Date.now() - startTimeRef.current
      fetch('/api/analytics/view', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewId: viewIdRef.current, durationMs }),
      }).catch(() => {})
    }, HEARTBEAT_MS)

    window.addEventListener('pagehide', sendDuration)
    document.addEventListener('visibilitychange', onHide)

    return () => {
      clearInterval(heartbeat)
      window.removeEventListener('pagehide', sendDuration)
      document.removeEventListener('visibilitychange', onHide)
      sendDuration()
    }
  }, [slug])

  return null
}
