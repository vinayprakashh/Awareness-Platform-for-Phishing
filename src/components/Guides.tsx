import { type CSSProperties } from 'react'
import {
  BookOpen,
  FileWarning,
  MailWarning,
  ShieldAlert,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import SpotlightCard from './react-bits/SpotlightCard'
import { useTheme } from '../lib/theme'

interface Guide {
  id: string
  title: string
  tagline: string
  accent: string
  icon: LucideIcon
  howItWorks: string
  example: string
  redFlags: string[]
  actions: string[]
}

const GUIDES: Guide[] = [
  {
    id: 'phishing',
    title: 'Phishing messages',
    tagline: 'The urgent message that wants a click',
    accent: 'rgba(56, 189, 248, 0.25)',
    icon: MailWarning,
    howItWorks:
      'A fake SMS, email or WhatsApp forward pretends to be your bank, courier or electricity provider. It pushes you to tap a link and "verify" details on a page that looks convincing.',
    example:
      '"URGENT: Your account is blocked because KYC expired. Click immediately to update within 24 hours."',
    redFlags: ['Urgency and threats', 'Links to lookalike domains', 'Requests for OTP, PIN or card details'],
    actions: ['Open the official app yourself', 'Check the full web address', 'Never enter secrets from a message link'],
  },
  {
    id: 'digital-arrest',
    title: 'Digital arrest scams',
    tagline: 'The call that says you must stay on video',
    accent: 'rgba(251, 113, 133, 0.25)',
    icon: ShieldAlert,
    howItWorks:
      'A caller claims to be from the CBI, ED, customs or police and says a parcel or money-laundering case is filed against you. They keep you on a video call, isolate you and demand money for "clearance".',
    example:
      '"This is CBI. A parcel with narcotics was intercepted. You are under arrest — stay on Skype and transfer money for police clearance."',
    redFlags: ['Arrest threat over a call', 'Video-call verification', 'Secrecy and payment demands'],
    actions: ['Hang up immediately', 'Call your local police station or 112 yourself', 'Police never demand money over a call'],
  },
  {
    id: 'malicious-apps',
    title: 'Malicious apps',
    tagline: 'The download that opens your phone to strangers',
    accent: 'rgba(167, 139, 250, 0.25)',
    icon: Smartphone,
    howItWorks:
      'A message offers a subsidy, prize or "official" app as an APK file. It asks you to allow installs from unknown sources and sometimes to install a remote-viewing tool so the scammer can guide you.',
    example:
      '"Download this APK and enable unknown sources. Then install AnyDesk so our team can verify your refund."',
    redFlags: ['.apk links outside app stores', '"Unknown sources" instructions', 'AnyDesk / TeamViewer requests'],
    actions: ['Install only from official stores', 'Keep unknown sources off', 'Uninstall remote-support apps you never chose'],
  },
]

export default function Guides() {
  const theme = useTheme()
  const cardStyle = {
    '--spotlight-card-surface': theme === 'dark' ? 'rgba(8, 19, 35, 0.94)' : '#ffffff',
    '--spotlight-card-shadow':
      theme === 'dark'
        ? '0 30px 70px -45px rgba(0, 0, 0, 0.95)'
        : '0 18px 40px -24px rgba(15, 23, 42, 0.2)',
  } as CSSProperties

  return (
    <section id="learn" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <span className="eyebrow">Awareness guides</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Know the trick. Avoid the trap.
          </h2>
        </div>
        <p className="soft-text max-w-md text-sm leading-relaxed sm:text-base">
          Three short, jargon-free guides to the scams reported most often. Read one before you need it.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {GUIDES.map((guide) => {
          const Icon = guide.icon
          return (
            <SpotlightCard
              key={guide.id}
              spotlightColor={guide.accent}
              intensity={0.22}
              spotlightSize={280}
              theme={theme}
              className="flex h-full flex-col border border-white/10 p-6 sm:p-7"
              style={cardStyle}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-white/5 text-sky-200 ring-1 ring-white/10">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white">{guide.title}</h3>
                  <p className="text-xs font-medium text-sky-200/70">{guide.tagline}</p>
                </div>
              </div>

              <p className="soft-text mt-5 text-sm leading-relaxed">{guide.howItWorks}</p>

              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-rose-200 uppercase">
                  <FileWarning className="size-4" aria-hidden="true" />
                  What it looks like
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-200/90 italic">{guide.example}</p>
              </div>

              <div className="mt-5 flex-1">
                <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Watch for</p>
                <ul className="mt-2 space-y-2">
                  {guide.redFlags.map((flag) => (
                    <li key={flag} className="flex gap-2 text-sm text-slate-200">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-300" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                <p className="text-xs font-bold tracking-wide text-emerald-200 uppercase">Do this instead</p>
                <ul className="mt-2 space-y-2">
                  {guide.actions.map((action) => (
                    <li key={action} className="flex gap-2 text-sm text-emerald-50/90">
                      <BookOpen className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </SpotlightCard>
          )
        })}
      </div>
    </section>
  )
}
