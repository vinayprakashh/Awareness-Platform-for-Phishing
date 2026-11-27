import { useEffect, useState, type CSSProperties } from 'react'
import type { Severity } from '../lib/riskEngine'

const COLORS: Record<Severity, string> = {
  low: '#34d399',
  moderate: '#fbbf24',
  high: '#fb7185',
}

export default function ScoreGauge({ score, severity }: { score: number; severity: Severity }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(score)
      return
    }
    let frame = 0
    const started = performance.now()
    const step = (time: number) => {
      const progress = Math.min(1, (time - started) / 650)
      setDisplay(Math.round(score * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const label = severity === 'high' ? 'High risk' : severity === 'moderate' ? 'Moderate risk' : 'Low risk'

  return (
    <div
      className="score-ring relative grid size-36 shrink-0 place-items-center rounded-full sm:size-40"
      style={{ '--score': display, '--ring-color': COLORS[severity] } as CSSProperties}
      role="img"
      aria-label={`${label}. Risk score ${score} out of 100.`}
    >
      <div className="grid size-[calc(100%-12px)] place-items-center rounded-full bg-[#081426] text-center">
        <div>
          <div className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{display}</div>
          <div className="text-[0.65rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">/ 100</div>
        </div>
      </div>
    </div>
  )
}
