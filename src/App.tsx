import { lazy, Suspense, type ReactNode } from 'react'
import { ArrowDown, ClipboardPaste, ImagePlus, ScanSearch, ShieldCheck, Zap } from 'lucide-react'
import Header from './components/Header'
import Footer from './components/Footer'
import { useNearViewport } from './lib/useNearViewport'

const Scanner = lazy(() => import('./components/Scanner'))
const Guides = lazy(() => import('./components/Guides'))
const Safety = lazy(() => import('./components/Safety'))

const STEPS = [
  {
    icon: ClipboardPaste,
    title: 'Paste a message or screenshot',
    text: 'A suspicious SMS, call transcript, link or screenshot. Everything stays on your device.',
  },
  {
    icon: ScanSearch,
    title: 'See the red flags',
    text: 'We check urgency words, impersonation, deceptive links and app-install tricks.',
  },
  {
    icon: ShieldCheck,
    title: 'Know what to do',
    text: 'Get a clear risk score, plain-language next steps and official reporting links.',
  },
]

const EVIDENCE = [
  { title: 'Urgency pressure', detail: '“account is blocked” · “Click immediately”' },
  { title: 'Lookalike domain', detail: 'sbi-kyc-update.xyz — not sbi.co.in' },
  { title: 'Credential request', detail: '“verify” your account details' },
]

function SectionPlaceholder({ minHeight }: { minHeight: number }) {
  return (
    <div
      className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28"
      style={{ minHeight }}
      aria-hidden="true"
    >
      <div className="h-3 w-32 rounded-full bg-white/5" />
      <div className="mt-6 h-10 w-2/3 rounded-xl bg-white/5" />
      <div className="mt-10 h-64 rounded-2xl bg-white/[0.02]" />
    </div>
  )
}

function DeferredSection({
  id,
  minHeight,
  children,
}: {
  id: string
  minHeight: number
  children: ReactNode
}) {
  const { ref, visible } = useNearViewport<HTMLDivElement>('700px', id)
  const placeholder = <SectionPlaceholder minHeight={minHeight} />

  return (
    <div id={id} ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? <Suspense fallback={placeholder}>{children}</Suspense> : placeholder}
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#050c18] text-slate-100">
      <Header />

      <main>
        <section id="top" className="relative overflow-hidden">
          <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="hero-fade pointer-events-none absolute inset-x-0 top-0 h-[720px]" aria-hidden="true" />

          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-lg border border-sky-300/25 bg-sky-300/10 px-3 py-1.5 text-xs font-bold tracking-wide text-sky-100 uppercase">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  Free · private · no login
                </span>

                <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.03] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
                  Pause before
                  <br />
                  you click.
                </h1>

                <p className="soft-text mt-7 max-w-xl text-base leading-relaxed sm:text-lg">
                  Paste a suspicious message, screenshot, call transcript or link. Get an instant risk score, the
                  exact red flags behind it, and simple steps to stay safe — all inside your browser.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="#scanner"
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-300 px-6 py-3.5 text-sm font-bold text-[#04101f] shadow-lg shadow-sky-500/10 transition hover:bg-sky-200"
                  >
                    Check a message <ArrowDown className="size-4" aria-hidden="true" />
                  </a>
                  <a
                    href="#learn"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/5"
                  >
                    Learn the scams
                  </a>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-300" aria-hidden="true" />
                    Privacy-first analysis
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ImagePlus className="size-4 text-sky-300" aria-hidden="true" />
                    Screenshot OCR on device
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Zap className="size-4 text-amber-300" aria-hidden="true" />
                    Text results in under 1.5 s
                  </span>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[30rem]">
                <div className="hero-report relative p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-sky-300/25 bg-sky-300/10 text-sky-200">
                        <ScanSearch className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="eyebrow">Analysis report</p>
                        <p className="mt-0.5 font-mono text-[0.65rem] tracking-wide text-slate-500 uppercase">
                          Case VP-0427 · SMS intercept
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg border border-rose-400/30 bg-rose-400/10 px-2.5 py-1.5 text-[0.65rem] font-bold tracking-[0.12em] text-rose-200 uppercase">
                      High risk
                    </span>
                  </div>

                  <div className="sms-device mt-5">
                    <div className="sms-screen rounded-lg px-3 py-3">
                      <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-wide text-slate-500 uppercase">
                        <span>Unknown sender</span>
                        <span>Today · 10:42</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-200">
                        “Your{' '}
                        <mark className="signal-highlight">
                          account is blocked
                          <sup className="ml-0.5 font-mono text-[0.55rem] text-rose-100">01</sup>
                        </mark>
                        .{' '}
                        <mark className="signal-highlight">
                          Click immediately
                          <sup className="ml-0.5 font-mono text-[0.55rem] text-rose-100">02</sup>
                        </mark>{' '}
                        at{' '}
                        <mark className="signal-highlight">
                          sbi-kyc-update.xyz
                          <sup className="ml-0.5 font-mono text-[0.55rem] text-rose-100">03</sup>
                        </mark>{' '}
                        to verify.”
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-5 border-b border-white/10 pb-5">
                    <div
                      className="risk-gauge relative grid size-24 shrink-0 place-items-center rounded-full"
                      role="img"
                      aria-label="Risk score 87 out of 100"
                    >
                      <div className="grid size-[calc(100%-10px)] place-items-center rounded-full bg-[#050e1d] text-center">
                        <div>
                          <span className="block font-display text-3xl font-semibold leading-none text-white">87</span>
                          <span className="mt-1 block font-mono text-[0.55rem] tracking-[0.12em] text-slate-400 uppercase">
                            Risk / 100
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold text-white">Treat as a scam</p>
                      <p className="soft-text mt-1 text-xs leading-relaxed">
                        3 signals in 1 message. Do not open the link or call the number provided.
                      </p>
                      <div className="mt-3 flex gap-1" aria-hidden="true">
                        {Array.from({ length: 10 }, (_, index) => (
                          <span
                            key={index}
                            className={`h-1 flex-1 rounded-sm ${index < 9 ? 'bg-rose-400/80' : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow">Evidence</p>
                      <span className="font-mono text-[0.65rem] text-slate-500">3 / 3 signals</span>
                    </div>
                    <ol className="mt-3 space-y-2">
                      {EVIDENCE.map((item, index) => (
                        <li
                          key={item.title}
                          className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                        >
                          <span className="mt-0.5 grid size-5 place-items-center rounded-md border border-rose-400/25 bg-rose-400/10 font-mono text-[0.6rem] font-bold text-rose-200">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                            <p className="mt-0.5 font-mono text-[0.68rem] leading-relaxed text-slate-400">
                              {item.detail}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-3 text-xs leading-relaxed text-emerald-100">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                    Do not click. Check with your bank directly using the number on their official website.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-[#071225]/40">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-8 md:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-sky-300/20 bg-sky-300/10 text-sky-200">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-wide text-sky-300 uppercase">Step {index + 1}</p>
                    <h2 className="mt-1 font-semibold text-white">{step.title}</h2>
                    <p className="soft-text mt-1 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <DeferredSection id="scanner" minHeight={900}>
          <Scanner />
        </DeferredSection>
        <DeferredSection id="learn" minHeight={780}>
          <Guides />
        </DeferredSection>
        <DeferredSection id="safety" minHeight={820}>
          <Safety />
        </DeferredSection>
      </main>

      <Footer />
    </div>
  )
}
