/**
 * Stateless, in-memory heuristic risk engine.
 * Nothing is sent to a server, logged, or persisted.
 */

export type Severity = 'low' | 'moderate' | 'high'

export type SignalCategory =
  | 'digital-arrest'
  | 'phishing'
  | 'malicious-app'
  | 'url'
  | 'impersonation'
  | 'privacy'

export interface Signal {
  id: string
  label: string
  detail: string
  category: SignalCategory
  weight: number
  evidence: string[]
  tip: string
}

export interface Analysis {
  score: number
  severity: Severity
  summary: string
  signals: Signal[]
  steps: string[]
  elapsedMs: number
}

type Rule = {
  id: string
  label: string
  detail: string
  category: SignalCategory
  weight: number
  tip: string
  pattern: RegExp
}

/** Structured keyword ruleset: easy to review, extend and test. */
export const RULES: Rule[] = [
  {
    id: 'arrest-threat',
    label: 'Arrest or "digital arrest" threat',
    detail: 'A claim that you are under arrest or must stay on a video call until you pay.',
    category: 'digital-arrest',
    weight: 28,
    tip: 'Police and regulators never arrest people over a phone or video call. Hang up and verify locally.',
    pattern: /\b(digital arrest|under arrest|arrest warrant|you are being arrested|police clearance|court order)\b/gi,
  },
  {
    id: 'agency-impersonation',
    label: 'Law-enforcement or regulator impersonation',
    detail: 'Mentions CBI, ED, narcotics, customs or money laundering to scare you into complying.',
    category: 'impersonation',
    weight: 18,
    tip: 'Real agencies do not ask for money, OTPs or video-call "verification".',
    pattern: /\b(cbi|ed\b|enforcement directorate|narcotics|customs? parcel|money laundering|cyber cell|income tax department|reserve bank of india|rbi)\b/gi,
  },
  {
    id: 'video-verification',
    label: 'Forced video-call verification',
    detail: 'A request to stay on Skype, Zoom, Teams or WhatsApp video while a "case" is checked.',
    category: 'digital-arrest',
    weight: 22,
    tip: 'End the call. Contact the organisation or police independently using an official number.',
    pattern: /\b(?:skype|zoom|teams|video call|whatsapp call|video verification)[^.!?\n]{0,80}\b(?:verif|investigat|clearance|police|cbi|ed\b|case)\b|\b(?:verif|investigat|clearance|police|cbi)[^.!?\n]{0,80}\b(?:skype|zoom|teams|video call|video verification)\b/gi,
  },
  {
    id: 'urgency',
    label: 'Urgency or pressure language',
    detail: 'Phrases designed to make you act before you can think or verify.',
    category: 'phishing',
    weight: 14,
    tip: 'Urgency is a classic manipulation tactic. Slow down and check independently.',
    pattern: /\b(account\s+(?:is\s+)?blocked|kyc\s+(?:expired|update|pending|not updated)|click\s+(?:here\s+)?immediately|act\s+now|urgent|last chance|final warning|within\s+\d+\s*(?:hours?|hrs|minutes?)|expires?\s+today|electricity[^.!?\n]{0,30}(?:cut|disconnect))\b/gi,
  },
  {
    id: 'reward-bait',
    label: 'Lottery, prize or reward bait',
    detail: 'A claim that you have won money or a refund is waiting for a "fee".',
    category: 'phishing',
    weight: 16,
    tip: 'You cannot win a lottery you never entered. Never pay a fee to receive money.',
    pattern: /\b(lottery|prize|reward|cashback|refund)\b[^.!?\n]{0,50}\b(claimed|won|approved|pending|waiting|released)\b/gi,
  },
  {
    id: 'advance-fee',
    label: 'Advance-fee request',
    detail: 'You are told to pay a fee or tax before receiving money or a prize.',
    category: 'phishing',
    weight: 26,
    tip: 'Legitimate prizes and refunds never require you to pay first.',
    pattern: /\b(?:processing|handling|release|clearance|transfer|tax|service)\s+fee\b|\bfee\b[^.!?\n]{0,30}\b(?:release|claim|transfer|refund|prize|lottery)\b/gi,
  },
  {
    id: 'credential-request',
    label: 'Request for passwords, OTP or PIN',
    detail: 'Asks you to share or enter secrets that no legitimate organisation will ask for.',
    category: 'phishing',
    weight: 24,
    tip: 'Never share an OTP, UPI PIN, CVV, password or OTP screenshot with anyone.',
    pattern: /\b(?:share|send|enter|verify|confirm|provide)\b[^.!?\n]{0,45}\b(?:otp|one[- ]?time password|upi pin|cvv|card (?:number|details)|password|netbanking|screenshot of otp)\b|\b(?:otp|upi pin|cvv|card number|password)\b[^.!?\n]{0,30}\b(?:share|send|verify|confirm)\b/gi,
  },
  {
    id: 'money-pressure',
    label: 'Pressure to transfer money',
    detail: 'Instructions to pay, transfer or deposit money immediately.',
    category: 'phishing',
    weight: 20,
    tip: 'Stop. Verify the request with a known official contact before any payment.',
    pattern: /\b(?:transfer|send|deposit|pay|remain|keep)\b[^.!?\n]{0,40}\b(?:money|funds|amount|₹\s?\d+|rs\.?\s?\d+|upi|fine|penalty|security deposit|processing fee)\b|\b(?:pay|transfer)\s+(?:the\s+)?(?:fine|penalty|fee|amount)\b/gi,
  },
  {
    id: 'secrecy',
    label: 'Secrecy or "do not hang up" instruction',
    detail: 'Attempts to isolate you from family, friends or the bank while the scam continues.',
    category: 'privacy',
    weight: 16,
    tip: 'A genuine official will never ask you to hide the conversation from your family.',
    pattern: /\b(?:do not|don't|dont|please don't)\s+(?:tell|inform|hang up|disconnect|share with)[^.!?\n]{0,30}\b(?:anyone|family|friend|bank|police)?\b|\bkeep (?:this|it) (?:confidential|secret|between us)\b/gi,
  },
  {
    id: 'remote-access',
    label: 'Remote screen-sharing app mentioned',
    detail: 'AnyDesk, TeamViewer or QuickSupport can let a stranger control your phone or computer.',
    category: 'malicious-app',
    weight: 26,
    tip: 'Never install a remote-support app at a stranger’s request. Uninstall it if present.',
    pattern: /\b(anydesk|teamviewer|quicksupport|remote (?:desktop|access|screen|support)|screen sharing|screen share)\b/gi,
  },
  {
    id: 'unknown-sources',
    label: 'Instruction to enable unknown sources',
    detail: 'Enabling installs from unknown sources bypasses your phone’s built-in safety checks.',
    category: 'malicious-app',
    weight: 25,
    tip: 'Keep "Install unknown apps" turned off. Install apps only from official stores.',
    pattern: /\b(?:enable|allow|turn on)\b[^.!?\n]{0,30}\b(?:unknown sources|install unknown apps|unknown apps)\b/gi,
  },
  {
    id: 'apk-file',
    label: 'APK / app download prompt',
    detail: 'A direct app file link can install malware or a fake banking app.',
    category: 'malicious-app',
    weight: 24,
    tip: 'Do not open .apk links from messages. Use the official app store instead.',
    pattern: /\.apk\b|\bdownload\s+(?:the\s+)?(?:app|apk|file)\b/gi,
  },
]

const SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'ow.ly', 'cutt.ly',
  'rebrand.ly', 'tiny.cc', 'shorturl.at', 'rb.gy', 's.id', 'buff.ly', 'shorte.st',
]

const SUSPICIOUS_TLDS = [
  'xyz', 'top', 'click', 'country', 'loan', 'work', 'cyou', 'live', 'icu',
  'gq', 'cf', 'tk', 'ml', 'ga', 'zip', 'mov', 'rest', 'monster', 'bond',
]

const BRANDS = [
  'sbi', 'hdfc', 'icici', 'axisbank', 'kotak', 'pnb', 'bankofbaroda', 'paytm',
  'phonepe', 'rbi', 'incometax', 'indiapost', 'aadhaar', 'uidai', 'netflix', 'amazon',
]

const TRUSTED_DOMAINS = [
  'sbi.co.in', 'onlinesbi.sbi', 'hdfcbank.com', 'icicibank.com', 'axisbank.com',
  'kotak.com', 'pnbindia.in', 'bankofbaroda.in', 'paytm.com', 'phonepe.com',
  'rbi.org.in', 'incometax.gov.in', 'uidai.gov.in', 'indiapost.gov.in', 'gov.in',
  'nic.in', 'amazon.in', 'netflix.com', 'cybercrime.gov.in',
]

const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+|\b[a-z0-9-]+(?:[.[\]()]*(?:dot|\.))+[a-z0-9-]+(?:[^\s<>"'`]*)?\b/gi

const CATEGORY_CAPS: Record<SignalCategory, number> = {
  'digital-arrest': 55,
  impersonation: 25,
  phishing: 60,
  'malicious-app': 55,
  url: 60,
  privacy: 18,
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function evidenceFor(pattern: RegExp, text: string, limit = 3): string[] {
  const re = new RegExp(pattern.source, 'gi')
  const found: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null && found.length < limit) {
    const value = match[0].trim()
    if (value && !found.some((item) => item.toLowerCase() === value.toLowerCase())) found.push(value)
    if (match[0].length === 0) re.lastIndex += 1
  }
  return found
}

function extractUrls(text: string): string[] {
  const matches = text.match(URL_PATTERN) ?? []
  const cleaned = matches
    .map((url) => url.replace(/[.,;:!?'")\]}]+$/g, ''))
    .filter((url) => url.length > 3)
  return [...new Set(cleaned)].slice(0, 8)
}

function parseUrl(raw: string): { url: URL; secure: boolean } | null {
  const normalized = raw
    .replace(/\[\s*\.\s*\]|\(\s*dot\s*\)|\[\s*dot\s*\]/gi, '.')
    .replace(/\s*(?:\[dot\]|\(dot\))\s*/gi, '.')
  const secure = /^https:\/\//i.test(normalized)
  const candidate = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`
  try {
    return { url: new URL(candidate), secure }
  } catch {
    return null
  }
}

function hostnameFlags(raw: string): Signal[] {
  const parsed = parseUrl(raw)
  if (!parsed) return []
  const host = parsed.url.hostname.toLowerCase().replace(/^www\./, '')
  const path = parsed.url.pathname.toLowerCase()
  const signals: Signal[] = []

  const push = (signal: Omit<Signal, 'category' | 'evidence'>) =>
    signals.push({ ...signal, category: 'url', evidence: [raw] })

  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || /^\[[0-9a-f:]+\]$/i.test(host)) {
    push({
      id: 'url-ip-address',
      label: 'Raw IP address instead of a named website',
      detail: 'Scam pages often hide behind a bare numeric address.',
      weight: 20,
      tip: 'Do not open links made of numbers. Type the official website address yourself.',
    })
  }
  if (!parsed.secure) {
    push({
      id: 'url-insecure',
      label: 'Non-HTTPS link',
      detail: 'The link does not use a secure connection.',
      weight: 12,
      tip: 'A legitimate service will use HTTPS. Do not enter details on an insecure page.',
    })
  }
  if (SHORTENERS.some((shortener) => host === shortener || host.endsWith(`.${shortener}`))) {
    push({
      id: 'url-shortener',
      label: 'Link shortener hides the real destination',
      detail: 'Short links make it easy to disguise a malicious website.',
      weight: 18,
      tip: 'Do not tap shortened links from messages. Ask the sender for the full address.',
    })
  }
  if (SUSPICIOUS_TLDS.includes(host.split('.').at(-1) ?? '')) {
    push({
      id: 'url-suspicious-tld',
      label: 'Unusual domain ending',
      detail: 'The address uses a domain ending frequently seen in scam pages.',
      weight: 16,
      tip: 'Bank and government services in India normally use .co.in, .com or .gov.in.',
    })
  }
  if (host.split('.').filter(Boolean).length >= 5) {
    push({
      id: 'url-many-subdomains',
      label: 'Excessive subdomains',
      detail: 'Long chains of subdomains are used to impersonate trusted brands.',
      weight: 15,
      tip: 'Read the address from right to left: only the last two parts identify the real site.',
    })
  }
  const brand = BRANDS.find((item) => host.includes(item))
  if (brand && !TRUSTED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    push({
      id: 'url-lookalike-brand',
      label: 'Lookalike brand domain',
      detail: `The address contains "${brand}" but is not an official ${brand} domain.`,
      weight: 24,
      tip: 'Open the organisation’s official app or type its known address instead.',
    })
  }
  if (host.includes('xn--') || /[\u0080-\uffff]/.test(host)) {
    push({
      id: 'url-encoded-domain',
      label: 'Encoded or non-Latin domain',
      detail: 'This can disguise a lookalike character in the address.',
      weight: 14,
      tip: 'Avoid typing any details on such a page.',
    })
  }
  if ((host.match(/-/g) ?? []).length >= 2 && /kyc|verify|secure|update|login|account|bank/.test(host)) {
    push({
      id: 'url-deceptive-name',
      label: 'Deceptive domain name',
      detail: 'The address is padded with hyphens and security-related words.',
      weight: 18,
      tip: 'Genuine organisations do not create separate "kyc-update" websites.',
    })
  }
  if (/\.apk$/.test(path)) {
    push({
      id: 'url-apk-file',
      label: 'Direct APK download link',
      detail: 'The link downloads an Android app file outside the official store.',
      weight: 26,
      tip: 'Do not install APK files received in messages.',
    })
  }
  return signals
}

function mergeSignals(signals: Signal[]): Signal[] {
  const byId = new Map<string, Signal>()
  for (const signal of signals) {
    const existing = byId.get(signal.id)
    if (!existing) {
      byId.set(signal.id, { ...signal, evidence: [...signal.evidence] })
      continue
    }
    for (const item of signal.evidence) {
      if (!existing.evidence.some((value) => value.toLowerCase() === item.toLowerCase())) {
        existing.evidence.push(item)
      }
    }
    existing.evidence = existing.evidence.slice(0, 4)
  }
  return [...byId.values()]
}

function stepsFor(severity: Severity, signals: Signal[]): string[] {
  const categories = new Set(signals.map((signal) => signal.category))
  const steps: string[] = []

  if (severity === 'high') {
    steps.push('Stop — do not click links, open files or reply to the sender.')
    steps.push('Do not transfer money or pay any "fee", "fine" or "deposit".')
  } else if (severity === 'moderate') {
    steps.push('Pause and verify this through an official website, app or phone number.')
    steps.push('Do not act on payment or login requests from this message.')
  } else {
    steps.push('Stay alert: check the sender and the full link before you act.')
  }

  steps.push('Never share OTPs, UPI PINs, passwords, CVV or ID photos with anyone.')
  if (categories.has('digital-arrest') || categories.has('impersonation')) {
    steps.push('Police, CBI and ED do not demand money or verify cases over video calls. Hang up and call your local police station or 112 if threatened.')
  }
  if (categories.has('malicious-app')) {
    steps.push('Do not install the app or enable "unknown sources". Uninstall any remote-support app you did not install yourself.')
  }
  if (categories.has('phishing') || categories.has('url')) {
    steps.push('Open the organisation’s official app or type its known address yourself instead of using the link.')
  }
  steps.push('Block the sender and report it to the Cyber Crime Helpline 1930 or at cybercrime.gov.in.')
  return steps
}

function summarise(score: number, severity: Severity, signalCount: number): string {
  if (!signalCount) {
    return 'No strong scam indicators found. Keep checking unexpected messages before you act.'
  }
  if (severity === 'high') {
    return `High risk (${score}/100): ${signalCount} classic warning sign${signalCount === 1 ? '' : 's'} found. Treat this as a scam until verified.`
  }
  if (severity === 'moderate') {
    return `Moderate risk (${score}/100): ${signalCount} suspicious detail${signalCount === 1 ? '' : 's'} found. Verify through an official channel first.`
  }
  return `Low risk (${score}/100): a few mild signals were found. Check the source before acting.`
}

export function analyze(input: string): Analysis {
  const started = now()
  const text = (input ?? '').trim()
  const signals: Signal[] = []

  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      const evidence = evidenceFor(rule.pattern, text)
      signals.push({
        id: rule.id,
        label: rule.label,
        detail: rule.detail,
        category: rule.category,
        weight: rule.weight,
        tip: rule.tip,
        evidence,
      })
    }
  }
  // `.test` with a global regex advances lastIndex; reset all rules for repeat analyses.
  for (const rule of RULES) rule.pattern.lastIndex = 0

  for (const url of extractUrls(text)) {
    signals.push(...hostnameFlags(url))
  }

  const merged = mergeSignals(signals)
  const categoryTotals = new Map<SignalCategory, number>()
  for (const signal of merged) {
    categoryTotals.set(signal.category, (categoryTotals.get(signal.category) ?? 0) + signal.weight)
  }
  const capped = [...categoryTotals.entries()].reduce(
    (sum, [category, total]) => sum + Math.min(total, CATEGORY_CAPS[category]),
    0,
  )
  const score = text ? Math.min(100, Math.round(capped)) : 0
  const severity: Severity = score >= 55 ? 'high' : score >= 25 ? 'moderate' : 'low'

  return {
    score,
    severity,
    summary: summarise(score, severity, merged.length),
    signals: merged.sort((a, b) => b.weight - a.weight),
    steps: stepsFor(severity, merged),
    elapsedMs: Math.max(0.1, now() - started),
  }
}
