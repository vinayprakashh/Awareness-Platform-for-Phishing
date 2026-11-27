import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  Flag,
  Info,
  Link2,
  LockKeyhole,
  PhoneCall,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import ClickSpark from './react-bits/ClickSpark'
import StarBorder from './react-bits/StarBorder'
import ScoreGauge from './ScoreGauge'
import { analyze, type Analysis, type SignalCategory } from '../lib/riskEngine'
import { SAMPLES, type Sample } from '../lib/samples'

const CATEGORY_META: Record<SignalCategory, { label: string; icon: LucideIcon }> = {
  'digital-arrest': { label: 'Digital arrest', icon: ShieldAlert },
  impersonation: { label: 'Impersonation', icon: Fingerprint },
  phishing: { label: 'Phishing', icon: AlertTriangle },
  'malicious-app': { label: 'Malicious app', icon: LockKeyhole },
  url: { label: 'Suspicious link', icon: Link2 },
  privacy: { label: 'Isolation tactic', icon: Info },
}

const SEVERITY_META = {
  high: {
    label: 'High risk',
    className: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
    icon: ShieldAlert,
  },
  moderate: {
    label: 'Moderate risk',
    className: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
    icon: AlertTriangle,
  },
  low: {
    label: 'Low risk',
    className: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
    icon: ShieldCheck,
  },
} as const

function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  const ranges = useMemo(() => {
    const lower = text.toLowerCase()
    const matches: { start: number; end: number }[] = []
    for (const term of terms) {
      const needle = term.toLowerCase()
      if (!needle) continue
      let from = 0
      while (matches.length < 80) {
        const index = lower.indexOf(needle, from)
        if (index < 0) break
        matches.push({ start: index, end: index + needle.length })
        from = index + needle.length
      }
    }
    matches.sort((a, b) => a.start - b.start)
    const merged: { start: number; end: number }[] = []
    for (const match of matches) {
      const last = merged[merged.length - 1]
      if (last && match.start <= last.end) last.end = Math.max(last.end, match.end)
      else merged.push({ ...match })
    }
    return merged
  }, [text, terms])

  if (!ranges.length) return <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">{text}</p>

  const nodes: ReactNode[] = []
  let cursor = 0
  ranges.forEach((range, index) => {
    if (range.start > cursor) nodes.push(<span key={`plain-${index}`}>{text.slice(cursor, range.start)}</span>)
    nodes.push(
      <mark key={`mark-${index}`} className="signal-highlight">
        {text.slice(range.start, range.end)}
      </mark>,
    )
    cursor = range.end
  })
  if (cursor < text.length) nodes.push(<span key="tail">{text.slice(cursor)}</span>)

  return <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-300">{nodes}</p>
}

export default function Scanner() {
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const timer = useRef<number | undefined>(undefined)
  const textarea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const runScan = () => {
    if (!input.trim()) {
      setError('Paste a message, call script or link first.')
      textarea.current?.focus()
      return
    }
    setError('')
    setScanning(true)
    setAnalysis(null)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setAnalysis(analyze(input))
      setScanning(false)
    }, 240)
  }

  const loadSample = (sample: Sample) => {
    window.clearTimeout(timer.current)
    setInput(sample.text)
    setAnalysis(null)
    setError('')
    setScanning(false)
    textarea.current?.focus()
  }

  const clearAll = () => {
    window.clearTimeout(timer.current)
    setInput('')
    setAnalysis(null)
    setError('')
    setScanning(false)
    textarea.current?.focus()
  }

  const terms = useMemo(() => analysis?.signals.flatMap((signal) => signal.evidence) ?? [], [analysis])
  const severity = analysis ? SEVERITY_META[analysis.severity] : null

  return (
    <section id="scanner" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">Free instant check</span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Check a suspicious message or link
        </h2>
        <p className="soft-text mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
          Paste exactly what you received — a WhatsApp forward, SMS, call transcript or URL. Get a plain-language
          risk score, the red flags we found and what to do next.
        </p>
      </div>

      <ClickSpark
        sparkColor={['#38bdf8', '#a78bfa', '#34d399']}
        sparkSize={9}
        sparkRadius={24}
        sparkCount={8}
        duration={420}
        className="mt-10 h-full w-full"
      >
        <div className="panel p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <ScanLine className="size-5 text-sky-300" aria-hidden="true" />
              Suspected text &amp; link analyzer
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <LockKeyhole className="size-4 text-emerald-300" aria-hidden="true" />
              Runs in your browser · nothing saved
            </div>
          </div>

          <label htmlFor="scam-input" className="sr-only">
            Suspicious message, call transcript or link
          </label>
          <textarea
            id="scam-input"
            ref={textarea}
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setError('')
            }}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') runScan()
            }}
            placeholder="Paste a suspicious message, call script or URL here…"
            className="mt-5 min-h-44 w-full resize-y rounded-2xl border border-white/10 bg-[#050e1d]/80 p-5 text-base leading-relaxed text-white placeholder:text-slate-500 focus:border-sky-300/50 focus:ring-2 focus:ring-sky-300/20 focus:outline-none"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'input-error' : 'input-hint'}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span id="input-hint" className="text-slate-500">
              Tip: press Ctrl / ⌘ + Enter to analyze
            </span>
            <span className="text-slate-500">{input.length.toLocaleString()} characters</span>
          </div>
          {error && (
            <p id="input-error" role="alert" className="mt-2 text-sm font-medium text-rose-300">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StarBorder
              as="button"
              type="button"
              onClick={runScan}
              disabled={scanning}
              color="#67e8f9"
              trailColor="#38bdf8"
              duration={3.5}
              glow={0.5}
              radius={999}
              backgroundColor="#0d2340"
              className="px-7 py-3.5 text-sm font-bold text-white"
            >
              {scanning ? 'Scanning…' : 'Analyze risk'}
              {!scanning && <ArrowRight className="size-4" aria-hidden="true" />}
            </StarBorder>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/25 hover:text-white"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Clear
            </button>
            <span className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Timer className="size-4" aria-hidden="true" />
              Average result: under 1.5 seconds
            </span>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-200">
              <Sparkles className="size-4 text-violet-300" aria-hidden="true" />
              Sample scam simulator
              <span className="font-normal text-slate-500">— tap one to see how the detector responds</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample)}
                  title={sample.hint}
                  className="rounded-full border border-white/10 bg-[#0a1a30] px-4 py-2 text-left text-xs font-medium text-slate-300 transition hover:border-sky-300/40 hover:bg-sky-300/10 hover:text-white"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {scanning && (
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-sky-300/20 bg-sky-300/5 p-5 text-sm text-sky-100" role="status">
              <span className="size-4 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300" />
              Checking keywords, links and app-download signals…
            </div>
          )}

          {analysis && severity && (
            <div className="mt-10 border-t border-white/10 pt-8" aria-live="polite">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <ScoreGauge score={analysis.score} severity={analysis.severity} />
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase ${severity.className}`}
                  >
                    <severity.icon className="size-4" aria-hidden="true" />
                    {severity.label}
                  </span>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {analysis.severity === 'high'
                      ? 'Treat this as a scam.'
                      : analysis.severity === 'moderate'
                        ? 'Be careful with this one.'
                        : 'Nothing obvious — stay alert.'}
                  </h3>
                  <p className="soft-text mt-2 max-w-2xl leading-relaxed">{analysis.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Analyzed in {analysis.elapsedMs.toFixed(1)} ms · in memory only, no scan history
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#07142a]/70 p-5 sm:p-6">
                  <h4 className="flex items-center gap-2 text-lg font-bold text-white">
                    <Flag className="size-5 text-rose-300" aria-hidden="true" />
                    Red flags found
                  </h4>
                  {analysis.signals.length === 0 ? (
                    <div className="mt-5 flex gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" aria-hidden="true" />
                      <p className="text-sm leading-relaxed text-emerald-100/90">
                        No known scam patterns matched. Scams change constantly, so still verify unexpected requests
                        through an official channel.
                      </p>
                    </div>
                  ) : (
                    <ul className="mt-5 space-y-3">
                      {analysis.signals.map((signal) => {
                        const meta = CATEGORY_META[signal.category]
                        const Icon = meta.icon
                        return (
                          <li key={signal.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex items-start gap-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-400/10 text-rose-300">
                                <Icon className="size-5" aria-hidden="true" />
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-white">{signal.label}</span>
                                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-slate-400 uppercase">
                                    {meta.label}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm leading-relaxed text-slate-300">{signal.detail}</p>
                                {signal.evidence.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {signal.evidence.map((item) => (
                                      <code key={item} className="max-w-full truncate rounded bg-[#020915] px-2 py-1 text-[0.7rem] text-rose-200">
                                        {item}
                                      </code>
                                    ))}
                                  </div>
                                )}
                                <p className="mt-2 text-xs leading-relaxed text-sky-200/80">
                                  <span className="font-semibold">Why it matters:</span> {signal.tip}
                                </p>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#07142a]/70 p-5 sm:p-6">
                  <h4 className="flex items-center gap-2 text-lg font-bold text-white">
                    <CheckCircle2 className="size-5 text-emerald-300" aria-hidden="true" />
                    What to do now
                  </h4>
                  <ol className="mt-5 space-y-3">
                    {analysis.steps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-200">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-300/10 text-xs font-bold text-sky-200">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div id="report" className="mt-6 rounded-xl border border-rose-400/25 bg-rose-400/5 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-rose-100">
                      <PhoneCall className="size-4" aria-hidden="true" />
                      Official reporting channels
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="tel:1930"
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-400 px-4 py-2 text-sm font-bold text-[#1a0710] transition hover:bg-rose-300"
                      >
                        Call 1930 <ArrowRight className="size-4" aria-hidden="true" />
                      </a>
                      <a
                        href="https://cybercrime.gov.in/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/30"
                      >
                        cybercrime.gov.in <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                      <a
                        href="tel:112"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/30"
                      >
                        Emergency 112
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#07142a]/70 p-5">
                <p className="mb-3 text-xs font-bold tracking-wide text-slate-400 uppercase">The text we checked</p>
                <HighlightedText text={input} terms={terms} />
                <p className="mt-3 text-xs text-slate-500">Highlighted words are the exact triggers behind the flags above.</p>
              </div>
            </div>
          )}
        </div>
      </ClickSpark>
    </section>
  )
}
