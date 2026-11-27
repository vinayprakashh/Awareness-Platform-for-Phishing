/**
 * Browser-side inference for the compact TF-IDF + logistic-regression models.
 *
 * The feature extraction below mirrors `ml/train_model.py` exactly. Both models
 * were trained on public, licensed GitHub datasets (see ml/SOURCES.md) and are
 * shipped only as numeric weights — no raw message is ever uploaded or stored.
 */
import textJson from '../ml/text_model.json'
import urlJson from '../ml/url_model.json'
import { extractUrls } from './urlUtils'

interface ModelJson {
  version: number
  name: string
  config: { analysis: string; maxFeatures: number; trainedOn: number; sources: string[] }
  vocab: string[]
  idf: number[]
  weights: number[]
  bias: number
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1: number
    rocAuc: number
    threshold: number
  }
}

const textModel = textJson as ModelJson
const urlModel = urlJson as ModelJson

const TEXT_INDEX = new Map(textModel.vocab.map((term, index) => [term, index]))
const URL_INDEX = new Map(urlModel.vocab.map((term, index) => [term, index]))

const WORD_RE = /[a-z]{2,}|\d{2,}/g
const PLACEHOLDER_RE = /<[^>]{1,40}>/g
const URL_TOKEN_RE = /https?:\/\/\S+/g
const BRAND_WORDS = /paypal|bank|sbi|hdfc|icici|axis|kotak|upi|kyc|verify|secure|login|account|amazon|netflix|gov|incometax|whatsapp|apple|microsoft|delivery|parcel/
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'click', 'country', 'loan', 'work', 'cyou', 'live', 'icu',
  'gq', 'cf', 'tk', 'ml', 'ga', 'zip', 'mov', 'rest', 'monster', 'bond',
])

export interface AiResult {
  available: boolean
  textProbability: number
  urlProbability: number | null
  /** Blended 0-100 risk contribution from the models. */
  score: number
  /** 0-1: how far the blended probability sits from a coin flip. */
  confidence: number
  topTerms: string[]
  analyzedUrl: string | null
  elapsedMs: number
}

export interface ModelInfo {
  name: string
  trainedOn: number
  metrics: ModelJson['metrics']
  sources: string[]
}

export const MODEL_INFO: Record<'text' | 'url', ModelInfo> = {
  text: {
    name: 'Message / smishing classifier',
    trainedOn: textModel.config.trainedOn,
    metrics: textModel.metrics,
    sources: textModel.config.sources,
  },
  url: {
    name: 'Deceptive URL classifier',
    trainedOn: urlModel.config.trainedOn,
    metrics: urlModel.metrics,
    sources: urlModel.config.sources,
  },
}

function normaliseText(raw: string): string {
  return raw
    .replace(PLACEHOLDER_RE, ' ')
    .replace(URL_TOKEN_RE, ' urltoken ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 1200)
}

function textFeatures(raw: string): string[] {
  const norm = normaliseText(raw)
  const words = (norm.match(WORD_RE) ?? []).slice(0, 180)
  const features = words.map((word) => `w:${word}`)
  for (let i = 0; i < words.length - 1; i += 1) features.push(`b:${words[i]}_${words[i + 1]}`)
  for (const n of [3, 4]) {
    for (let i = 0; i <= norm.length - n; i += 1) features.push(`c:${norm.slice(i, i + n)}`)
  }
  return features
}

function normaliseUrl(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '').slice(0, 240)
}

function urlFeatures(raw: string): string[] {
  const url = normaliseUrl(raw)
  const features: string[] = []
  for (const n of [3, 4, 5]) {
    for (let i = 0; i <= url.length - n; i += 1) features.push(`c:${url.slice(i, i + n)}`)
  }

  const afterScheme = url.includes('//') ? url.split('//').slice(1).join('//') : url
  const host = afterScheme.split('/')[0].split('@').pop()!.split(':')[0]
  const tld = host.includes('.') ? host.split('.').pop()! : ''
  const digits = (url.match(/[0-9]/g) ?? []).length
  const length = url.length

  features.push(
    `L:${Math.floor(length / 10)}`,
    `D:${Math.min(Math.floor(digits / 3), 20)}`,
    `H:${Math.min((url.match(/-/g) ?? []).length, 8)}`,
    `P:${Math.min((url.match(/\./g) ?? []).length, 12)}`,
    `A:${Math.min((url.match(/@/g) ?? []).length, 3)}`,
    `Q:${Math.min((url.match(/\?/g) ?? []).length, 3)}`,
    `S:${Math.min((url.match(/\//g) ?? []).length - 2, 12)}`,
    tld && tld.length <= 8 ? `T:${tld}` : 'T:other',
    url.startsWith('http://') ? 'F:http' : 'F:https',
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) ? 'I:yes' : 'I:no',
    BRAND_WORDS.test(url) ? 'B:yes' : 'B:no',
    SUSPICIOUS_TLDS.has(tld) ? 'X:yes' : 'X:no',
    host.includes('xn--') ? 'U:yes' : 'U:no',
  )
  return features
}

interface SparseRow {
  indices: number[]
  values: number[]
}

function vectorise(features: string[], index: Map<string, number>, idf: number[]): SparseRow {
  const counts = new Map<number, number>()
  for (const feature of features) {
    const idx = index.get(feature)
    if (idx === undefined) continue
    counts.set(idx, (counts.get(idx) ?? 0) + 1)
  }
  const indices = [...counts.keys()]
  const values = indices.map((idx) => (1 + Math.log(counts.get(idx)!)) * idf[idx])
  let norm = 0
  for (const value of values) norm += value * value
  norm = Math.sqrt(norm)
  if (norm > 0) for (let i = 0; i < values.length; i += 1) values[i] /= norm
  return { indices, values }
}

function sigmoid(z: number): number {
  const clamped = Math.max(-30, Math.min(30, z))
  return 1 / (1 + Math.exp(-clamped))
}

function predict(row: SparseRow, model: ModelJson): number {
  let z = model.bias
  for (let i = 0; i < row.indices.length; i += 1) z += model.weights[row.indices[i]] * row.values[i]
  return sigmoid(z)
}

/** Turn a trained feature id into a short, human-readable explanation. */
function explainTerm(term: string): string | null {
  const prefix = term[0]
  const value = term.slice(2)
  switch (prefix) {
    case 'w': return value
    case 'b': return value.replace(/_/g, ' ')
    case 'c': return null // character n-grams are useful to the model but not to people
    case 'L': return 'link length pattern'
    case 'D': return 'digit-heavy link'
    case 'H': return 'hyphen-heavy link'
    case 'P': return 'many subdomains'
    case 'A': return 'embedded credentials marker'
    case 'Q': return 'query-string link'
    case 'S': return 'deep link path'
    case 'T': return value === 'other' ? 'unusual domain ending' : `.${value} domain`
    case 'F': return value === 'http' ? 'insecure http link' : 'https link'
    case 'I': return value === 'yes' ? 'raw IP address' : null
    case 'B': return value === 'yes' ? 'brand-related wording' : null
    case 'X': return value === 'yes' ? 'high-risk domain ending' : null
    case 'U': return value === 'yes' ? 'encoded domain' : null
    default: return null
  }
}

function topTerms(features: string[], index: Map<string, number>, model: ModelJson, limit: number): string[] {
  const row = vectorise(features, index, model.idf)
  return row.indices
    .map((idx) => {
      const label = explainTerm(model.vocab[idx])
      return label ? { term: label, impact: model.weights[idx] * row.values[idx] } : null
    })
    .filter((item): item is { term: string; impact: number } => item !== null && item.impact > 0.002)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, limit)
    .map((item) => item.term)
}

/** Screen the pasted text and any URLs it contains. Pure, stateless and local. */
export function analyzeAi(input: string): AiResult {
  const started = performance.now()
  const text = (input ?? '').trim()
  if (!text) {
    return {
      available: true,
      textProbability: 0,
      urlProbability: null,
      score: 0,
      confidence: 0,
      topTerms: [],
      analyzedUrl: null,
      elapsedMs: 0,
    }
  }

  const textFeatureList = textFeatures(text)
  const textProbability = predict(vectorise(textFeatureList, TEXT_INDEX, textModel.idf), textModel)

  const urls = extractUrls(text)
  let urlProbability: number | null = null
  let analyzedUrl: string | null = null
  let bestUrlFeatures: string[] | null = null
  for (const url of urls) {
    const features = urlFeatures(url)
    const probability = predict(vectorise(features, URL_INDEX, urlModel.idf), urlModel)
    if (urlProbability === null || probability > urlProbability) {
      urlProbability = probability
      analyzedUrl = url
      bestUrlFeatures = features
    }
  }

  const score = urlProbability === null
    ? textProbability * 100
    : (0.65 * textProbability + 0.35 * urlProbability) * 100

  const terms = topTerms(textFeatureList, TEXT_INDEX, textModel, 6)
  if (bestUrlFeatures && analyzedUrl) {
    const urlTerms = topTerms(bestUrlFeatures, URL_INDEX, urlModel, 4)
    terms.unshift(...urlTerms.filter((term) => !terms.includes(term)))
  }

  return {
    available: true,
    textProbability,
    urlProbability,
    score,
    confidence: Math.min(1, Math.abs(score / 100 - 0.5) * 2),
    topTerms: [...new Set(terms)].slice(0, 6),
    analyzedUrl,
    elapsedMs: performance.now() - started,
  }
}
