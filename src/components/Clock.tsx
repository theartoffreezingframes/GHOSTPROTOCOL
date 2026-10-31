import { useEffect, useState } from 'react'

/** Live UTC timestamp for HUD chrome. Updates once per second. */
export function UtcClock({ className }: { className?: string }) {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const hh = String(time.getUTCHours()).padStart(2, '0')
  const mm = String(time.getUTCMinutes()).padStart(2, '0')
  const ss = String(time.getUTCSeconds()).padStart(2, '0')

  return (
    <span className={className}>
      <span className="tabular-nums">
        {hh}:{mm}:{ss}
      </span>{' '}
      UTC
    </span>
  )
}
