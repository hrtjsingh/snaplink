export function AppBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--snap-bg)] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="snap-orb snap-orb-1" />
        <div className="snap-orb snap-orb-2" />
        <div className="snap-orb snap-orb-3" />
        <div className="snap-grid" />
      </div>
      {children}
    </div>
  )
}
