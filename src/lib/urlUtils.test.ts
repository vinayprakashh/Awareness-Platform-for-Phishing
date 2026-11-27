import { describe, expect, it } from 'vitest'
import { extractUrls, parseUrl } from './urlUtils'

describe('url utilities', () => {
  it('extracts normal and obfuscated addresses', () => {
    expect(extractUrls('Open http://192.168.10.42/login now')).toContain('http://192.168.10.42/login')
    expect(extractUrls('Open hdfc[dot]bank[dot]com/kyc now')).toContain('hdfc[dot]bank[dot]com/kyc')
  })

  it('normalises obfuscated dots before parsing', () => {
    expect(parseUrl('hdfc[dot]bank[dot]com/kyc')?.url.hostname).toBe('hdfc.bank.com')
    expect(parseUrl('sbi(dot)co.in/verify')?.url.hostname).toBe('sbi.co.in')
    expect(parseUrl('not a url')).toBeNull()
  })
})
