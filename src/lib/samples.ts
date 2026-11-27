import type { Severity } from './riskEngine'

export interface Sample {
  id: string
  label: string
  hint: string
  text: string
  expected: Severity
}

export const SAMPLES: Sample[] = [
  {
    id: 'digital-arrest',
    label: 'Digital arrest call',
    hint: 'Fake CBI / narcotics case',
    text: 'This is CBI. Your parcel containing narcotics has been intercepted and you are under arrest. Stay on Skype video verification. Transfer ₹45,000 for police clearance now. Do not tell anyone.',
    expected: 'high',
  },
  {
    id: 'kyc-phishing',
    label: 'KYC phishing SMS',
    hint: 'Lookalike bank link',
    text: 'URGENT: Your SBI account is blocked because KYC expired. Click immediately at http://sbi-kyc-update.xyz/verify to update. Last chance within 24 hours.',
    expected: 'high',
  },
  {
    id: 'malicious-app',
    label: 'Malicious app link',
    hint: 'APK + remote access',
    text: 'Your subsidy approval is ready. Download the APK from https://subsidy-guide.top/verify.apk and enable install from unknown sources. Install AnyDesk so our team can do video verification.',
    expected: 'high',
  },
  {
    id: 'prize-bait',
    label: 'Lottery prize message',
    hint: 'Fee to release money',
    text: 'Congratulations! Your ₹5,00,000 lottery reward has been claimed. Pay a processing fee of ₹2,000 via UPI to release the prize.',
    expected: 'high',
  },
  {
    id: 'short-link',
    label: 'Courier short link',
    hint: 'Hidden destination',
    text: 'Your courier delivery failed. Confirm your address at bit.ly/parcel-2x to avoid return.',
    expected: 'moderate',
  },
  {
    id: 'benign',
    label: 'Everyday message',
    hint: 'Nothing suspicious',
    text: "Hi! Are we still on for lunch tomorrow? I'll send the address after work.",
    expected: 'low',
  },
]
