import { describe, expect, it } from 'vitest'
import { analyze } from './riskEngine'
import { SAMPLES } from './samples'

describe('risk engine', () => {
  it.each(SAMPLES)('classifies $label as $expected risk', (sample) => {
    const result = analyze(sample.text)
    expect(result.severity).toBe(sample.expected)
  })

  it('returns no signals for an ordinary message', () => {
    const result = analyze("Hey, what time should we meet for coffee tomorrow?")
    expect(result.score).toBe(0)
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
})
