/** Shared URL extraction/normalisation used by both the rule engine and the AI model. */

const URL_PATTERN =
  /\b(?:https?:\/\/|www\.)[^\s<>"'`]+|\b[a-z0-9-]+(?:\s*(?:\.|\[\s*dot\s*\]|\(\s*dot\s*\)|\s+dot\s+)\s*)[a-z0-9-]+(?:[^\s<>"'`]*)?\b/gi

/** Extract URLs and obfuscated addresses such as `sbi[dot]com`. */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_PATTERN) ?? []
  const cleaned = matches
    .map((url) => url.replace(/[.,;:!?'")\]}]+$/g, ''))
    .filter((url) => url.length > 3)
  return [...new Set(cleaned)].slice(0, 8)
}

/** Turn obfuscated dotted addresses into a parseable URL and detect the scheme. */
export function parseUrl(raw: string): { url: URL; secure: boolean } | null {
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
