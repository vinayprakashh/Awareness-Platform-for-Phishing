import {
  ArrowDown,
  ClipboardPaste,
  ImagePlus,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import Aurora from './components/react-bits/Aurora'
import BlurText from './components/react-bits/BlurText'
import Header from './components/Header'
import Scanner from './components/Scanner'
import Guides from './components/Guides'
import Safety from './components/Safety'
import Footer from './components/Footer'

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

export default function App() {
  return (
    <div className="min-h-screen bg-[#050c18] text-slate-100">
      <Header />

      <main>
        <section id="top" className="relative overflow-hidden">
          <div className="hero-aurora pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-75" aria-hidden="true">
            <Aurora
              colorStops={['#0ea5e9', '#6366f1', '#a855f7', '#22d3ee']}
              amplitude={1.1}
              blend={0.65}
              speed={0.7}
              glow={0.75}
              opacity={0.85}
              mouseInteraction
            />
          </div>
          <div className="hero-fade pointer-events-none absolute inset-x-0 top-0 h-[720px]" aria-hidden="true" />

          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-xs font-bold tracking-wide text-sky-100 uppercase">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Free · private · no login
                </span>

                <h1 className="mt-7 text-5xl leading-[1.05] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Pause before
                  <br />
                  you click.
                </h1>
                <BlurText
                  text="Spot the scam before it spots you."
                  animateBy="words"
                  direction="top"
                  delay={110}
                  className="mt-4 text-2xl font-semibold text-sky-200 sm:text-3xl"
                />

                <p className="soft-text mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
                  Paste a suspicious message, screenshot, call transcript or link. Get an instant risk score, the
                  exact red flags behind it, and simple steps to stay safe — all inside your browser.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <a
                    href="#scanner"
                    className="inline-flex items-center gap-2 rounded-full bg-sky-300 px-7 py-3.5 text-sm font-bold text-[#04101f] shadow-lg shadow-sky-500/20 transition hover:bg-sky-200"
                  >
                    Check a message <ArrowDown className="size-4" aria-hidden="true" />
                  </a>
                  <a
                    href="#learn"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-white/35 hover:bg-white/5"
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

              <div className="animate-float-slow relative mx-auto w-full max-w-lg">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-sky-400/15 via-violet-400/10 to-transparent blur-2xl" aria-hidden="true" />
                <div className="panel relative p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow">Example result</span>
                    <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-bold text-rose-200">
                      HIGH RISK
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-relaxed text-slate-300">
                    <span className="text-slate-500">SMS · unknown sender</span>
                    <p className="mt-2">
                      “Your <mark className="signal-highlight">account is blocked</mark>.{' '}
                      <mark className="signal-highlight">Click immediately</mark> at sbi-kyc-update.xyz to verify.”
                    </p>
                  </div>

                  <div className="mt-5 space-y-2">
                    {[
                      'Urgency and pressure language',
                      'Lookalike bank domain',
                      'Request to verify account details',
                    ].map((flag) => (
                      <div key={flag} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                        <span className="size-2 shrink-0 rounded-full bg-rose-300" />
                        {flag}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-100">
                    <ShieldCheck className="size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                    Do not click. Check with your bank directly.
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
                    <h3 className="mt-1 font-semibold text-white">{step.title}</h3>
                    <p className="soft-text mt-1 text-sm leading-relaxed">{step.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <Scanner />
        <Guides />
        <Safety />
      </main>

      <Footer />
    </div>
  )
}
