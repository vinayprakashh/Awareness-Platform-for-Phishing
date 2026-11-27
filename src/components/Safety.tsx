import {
  AlertOctagon,
  BadgeCheck,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  LifeBuoy,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react'

const CHECKLIST = [
  {
    title: 'Stop before you act',
    text: 'Scams create panic. Put the phone down or close the page and take a breath.',
  },
  {
    title: 'Do not pay or share secrets',
    text: 'Never transfer money, pay a "fee", or share OTPs, UPI PINs, passwords or ID photos.',
  },
  {
    title: 'Verify independently',
    text: 'Call the company or police using a number from its official website or app — not the number in the message.',
  },
  {
    title: 'Keep the evidence',
    text: 'Save the message, link and transaction details, then block the sender.',
  },
  {
    title: 'Report quickly',
    text: 'Call 1930 or file a report at cybercrime.gov.in. Fast reporting helps freeze fraud money.',
  },
]

const HELP_LINKS = [
  {
    href: 'tel:1930',
    title: 'Cyber Crime Helpline',
    detail: '1930 · 24×7, India',
    icon: PhoneCall,
    primary: true,
  },
  {
    href: 'https://cybercrime.gov.in/',
    title: 'National Cyber Crime Portal',
    detail: 'File a complaint online',
    icon: Globe2,
    external: true,
  },
  {
    href: 'tel:112',
    title: 'Emergency services',
    detail: '112 · if you feel threatened',
    icon: LifeBuoy,
  },
  {
    href: 'tel:14567',
    title: 'Elderline',
    detail: '14567 · support for senior citizens',
    icon: BadgeCheck,
  },
]

export default function Safety() {
  return (
    <section className="border-y border-white/5 bg-[#071225]/60">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <span className="eyebrow">Stay safe</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            A simple checklist that works
          </h2>
          <p className="soft-text mt-4 text-base leading-relaxed sm:text-lg">
            Save these five steps. They apply to almost every phishing message, digital arrest call or fake app
            link you will ever receive.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-emerald-300" aria-hidden="true" />
              <h3 className="text-xl font-bold text-white">Before you click, pay or share</h3>
            </div>
            <ol className="mt-6 space-y-4">
              {CHECKLIST.map((item, index) => (
                <li key={item.title} className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-300/10 text-sm font-bold text-sky-200">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="soft-text mt-1 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <div className="panel p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <LifeBuoy className="size-6 text-rose-300" aria-hidden="true" />
                <h3 className="text-xl font-bold text-white">Official help</h3>
              </div>
              <p className="soft-text mt-2 text-sm leading-relaxed">
                Use only these verified channels. A scammer may quote a different "helpline" number.
              </p>
              <div className="mt-5 space-y-3">
                {HELP_LINKS.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer' : undefined}
                      className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                        link.primary
                          ? 'border-rose-300/40 bg-rose-400/10 hover:bg-rose-400/20'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                      }`}
                    >
                      <Icon className={`size-5 shrink-0 ${link.primary ? 'text-rose-200' : 'text-sky-200'}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-white">{link.title}</span>
                        <span className="block text-xs text-slate-400">{link.detail}</span>
                      </span>
                      {link.external ? (
                        <ExternalLink className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                      ) : (
                        <PhoneCall className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                      )}
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
              <div className="flex items-center gap-2">
                <AlertOctagon className="size-5 text-amber-300" aria-hidden="true" />
                <h3 className="font-bold text-amber-100">Already paid or shared an OTP?</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-amber-50/85">
                <li className="flex gap-2">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                  Call your bank immediately and ask them to block the transaction.
                </li>
                <li className="flex gap-2">
                  <PhoneCall className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                  Report on 1930 or cybercrime.gov.in within 24 hours.
                </li>
                <li className="flex gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
                  Keep screenshots, transaction IDs and the sender’s number for the report.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
