import { useEffect, useState } from 'react'
import { Menu, ShieldCheck, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { href: '#scanner', label: 'Check a message' },
  { href: '#learn', label: 'Learn the scams' },
  { href: '#safety', label: 'Stay safe' },
  { href: '#report', label: 'Report' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled ? 'border-white/10 bg-[#050c18]/90 backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#top" className="group flex items-center gap-3 rounded-lg" aria-label="VerifyPoint home">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-[#04101f] shadow-lg shadow-sky-500/20">
            <ShieldCheck className="size-6" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight text-white">VerifyPoint</span>
            <span className="block text-[0.65rem] font-semibold tracking-[0.16em] text-sky-300/80 uppercase">
              Cyber awareness
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#scanner"
          className="hidden rounded-full border border-sky-300/30 bg-sky-300/10 px-5 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-300/60 hover:bg-sky-300/20 md:inline-flex"
        >
          Check now
        </a>

        <ThemeToggle />

        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-white/10 bg-[#071224]/95 px-5 pb-5 pt-2 md:hidden" aria-label="Mobile navigation">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-base font-medium text-slate-200 hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
