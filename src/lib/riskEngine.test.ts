import { describe, expect, it } from 'vitest'
import { analyzeAi, MODEL_INFO } from './aiModel'
import { analyze } from './riskEngine'
import { SAMPLES } from './samples'

describe('risk engine', () => {
  it.each(SAMPLES)('classifies $label as $expected risk', (sample) => {
    const result = analyze(sample.text)
    expect(result.severity).toBe(sample.expected)
  })

  it('keeps an ordinary message low risk with no triggered signals', () => {
    const result = analyze("Hey, what time should we meet for coffee tomorrow?")
    expect(result.severity).toBe('low')
    expect(result.score).toBeLessThan(25)
    expect(result.signals).toHaveLength(0)
  })

  it('detects raw IP URLs and shorteners', () => {
    const result = analyze('Verify your account at http://192.168.10.42/login or bit.ly/verify-now')
    const ids = result.signals.map((signal) => signal.id)
    expect(ids).toContain('url-ip-address')
    expect(ids).toContain('url-insecure')
    expect(ids).toContain('url-shortener')
  })

  it('flags APK downloads and remote access tools', () => {
    const result = analyze('Install this app: https://free-reward.top/offer.apk then open AnyDesk.')
    const ids = result.signals.map((signal) => signal.id)
    expect(ids).toContain('url-apk-file')
    expect(ids).toContain('remote-access')
  })

  it('is stateless and repeatable', () => {
    const first = analyze(SAMPLES[0].text)
    const second = analyze(SAMPLES[0].text)
    expect(second.score).toBe(first.score)
    expect(second.signals.map((signal) => signal.id)).toEqual(first.signals.map((signal) => signal.id))
  })

  it('evaluates well under the 1.5 second target', () => {
    expect(analyze(SAMPLES[0].text).elapsedMs).toBeLessThan(1500)
  })

  it('adds an explainable AI signal for a likely scam', () => {
    const result = analyze(SAMPLES[1].text)
    const aiSignal = result.signals.find((signal) => signal.source === 'ai')
    expect(aiSignal).toBeDefined()
    expect(aiSignal!.evidence.length).toBeGreaterThan(0)
    expect(aiSignal!.detail).toContain('%')
  })
})

describe('browser AI model', () => {
  it('returns an inert result for empty input', () => {
    const ai = analyzeAi('')
    expect(ai.textProbability).toBe(0)
    expect(ai.urlProbability).toBeNull()
    expect(ai.score).toBe(0)
    expect(ai.confidence).toBe(0)
    expect(ai.topTerms).toHaveLength(0)
  })

  it('scores a KYC scam with both models and exposes contributing terms', () => {
    const ai = analyzeAi(SAMPLES[1].text)
    expect(ai.textProbability).toBeGreaterThan(0.5)
    expect(ai.urlProbability).not.toBeNull()
    expect(ai.urlProbability!).toBeGreaterThan(0.5)
    expect(ai.analyzedUrl).toContain('sbi-kyc-update.xyz')
    expect(ai.topTerms.length).toBeGreaterThan(0)
    expect(ai.confidence).toBeGreaterThan(0)
  })

  it('keeps an ordinary message below the model decision threshold', () => {
    const ai = analyzeAi('Hey, what time should we meet for coffee tomorrow?')
    expect(ai.textProbability).toBeLessThan(0.5)
  })

  it('ships holdout metrics and provenance with both models', () => {
    expect(MODEL_INFO.text.metrics.rocAuc).toBeGreaterThan(0.95)
    expect(MODEL_INFO.url.metrics.rocAuc).toBeGreaterThan(0.95)
    expect(MODEL_INFO.text.trainedOn).toBeGreaterThan(10_000)
    expect(MODEL_INFO.url.trainedOn).toBeGreaterThan(50_000)
    expect(MODEL_INFO.text.sources).toContain('reportsmishing/Smishing-Dataset-IMC25')
  })
})
