import { Moon, Sun } from 'lucide-react'
import { setTheme, useTheme } from '../lib/theme'

export default function ThemeToggle() {
  const theme = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:border-sky-300/40 hover:text-white"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === 'dark' ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
    </button>
  )
}
