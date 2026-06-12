'use client'

import { useEffect, useState } from 'react'

const LAUNCH_TIME = new Date('2026-11-01T00:00:00').getTime()

function getTimeLeft() {
  const difference = LAUNCH_TIME - Date.now()
  if (difference <= 0) return null

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex mt-16 sm:mt-28 items-center justify-center bg-transparent animate-fade-in-up px-4">
      <div className="max-w-xl w-full text-center text-white snap-card p-6 sm:p-10">
        <h1 className="mb-3 text-4xl font-bold md:text-5xl snap-gradient-text-static">
          🚀 Coming Soon
        </h1>

        <p className="mb-8 text-lg opacity-90">
          We’re building something amazing. Stay tuned!
        </p>

        {timeLeft ? (
          <div className="mb-8 sm:mb-10 flex flex-wrap justify-center gap-2 sm:gap-4">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md animate-scale-in"
              >
                <div className="text-3xl font-semibold">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="text-xs uppercase tracking-wide opacity-80">
                  {label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-8 text-xl font-semibold">🎉 We are live!</p>
        )}

        <p className="mt-6 text-sm opacity-70">
          © {new Date().getFullYear()} Snaplink. All rights reserved.
        </p>
      </div>
    </div>
  )
}
