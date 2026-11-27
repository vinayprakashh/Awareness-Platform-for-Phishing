import { ExternalLink, LockKeyhole } from 'lucide-react'
import verifypointLogo from '../assets/verifypoint-logo.png'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#040a15]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold text-white">
            <img src={verifypointLogo} alt="" className="brand-logo size-6 shrink-0 rounded-md object-contain" />
            VerifyPoint
          </div>
          <p className="soft-text mt-3 max-w-sm text-sm leading-relaxed">
            A free awareness tool for spotting phishing, digital arrest scams and malicious apps. No login, no
            tracking, no scan history.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-slate-300 uppercase">Explore</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <a className="hover:text-white" href="#scanner">Check a message or screenshot</a>
            <a className="hover:text-white" href="#learn">Awareness guides</a>
            <a className="hover:text-white" href="#safety">Safety checklist</a>
            <a className="hover:text-white" href="#report">Report cybercrime</a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-slate-300 uppercase">Privacy &amp; accuracy</p>
          <p className="soft-text mt-3 flex gap-2 text-sm leading-relaxed">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
            Your text and screenshots are analyzed in memory in your browser and are never uploaded or stored. Only
            your light/dark theme choice is saved on this device.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Results use pattern-based heuristics and can miss new scams. Always verify through official channels.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {YEAR} VerifyPoint · Cyber Security Awareness Platform</span>
          <a
            className="inline-flex items-center gap-1 hover:text-slate-200"
            href="https://github.com/DavidHDev/react-bits"
            target="_blank"
            rel="noreferrer"
          >
            UI components from React Bits <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
