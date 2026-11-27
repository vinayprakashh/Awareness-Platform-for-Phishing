# VerifyPoint — Cyber Security Awareness Platform

A lightweight, browser-based web app that checks suspicious messages, screenshots, call transcripts and links for phishing, digital arrest scams and malicious apps. It uses local OCR plus an explainable rule engine and two locally trained AI models, then returns a 0–100 risk score, red flags with matched evidence, and clear next steps with official Indian cybercrime reporting channels.

Built from the product requirements document for **Project #19** and uses selected [React Bits](https://github.com/DavidHDev/react-bits) components for the UI.

## Features

- **Instant analyzer (FR-01, FR-02):** paste text, a URL or a call script and get a score in milliseconds.
- **Screenshot detection:** paste (`Ctrl/⌘ + V`), drop or upload a screenshot; on-device OCR reads English/Hindi text and feeds the same detector.
- **Explainable red flags (FR-03):** each detected trigger is shown with the exact matched text, why it matters and its category.
- **AI second opinion:** two compact TF-IDF + logistic-regression models (message and URL) trained on licensed public GitHub datasets; their scores, confidence and top influences are shown in plain language.
- **Threat guides (FR-04):** plain-language modules for phishing, digital arrest scams and malicious apps with real-world examples.
- **Safety checklist & helplines (FR-05):** five-step checklist, official channels (1930, cybercrime.gov.in, 112, 14567) and guidance if you already paid.
- **Sample scam simulator (FR-06):** one-tap examples covering scams and a benign message.
- **Privacy-first:** analysis runs entirely in the browser in memory. Nothing you scan is stored or sent to a server. No login. Only your light/dark theme choice is saved locally.
- **Theme switcher:** toggle between dark and light themes from the header; your choice persists and defaults to your system preference.
- **Accessible & responsive:** mobile-first layout, high-contrast green/amber/red indicators, keyboard-friendly controls and reduced-motion support.

## Detection logic

The analyzer is deliberately **hybrid** so that no single method decides the result.

### 0. Screenshot intake (optional)

`src/lib/ocr.ts` lazily loads a bundled Tesseract.js worker, core and English +
Hindi language data from `public/tesseract/`. OCR runs in a Web Worker on your
device; the image is never uploaded, cached or stored. The recognised text is
shown back to you and passed through the exact same text and link checks as a
pasted message.

### 1. Transparent rules

`src/lib/riskEngine.ts` contains a structured ruleset that checks:

1. High-risk keywords and intent (digital arrest, CBI/ED impersonation, urgency, credential requests, advance fees, secrecy).
2. Deceptive URLs (raw IP addresses, shorteners, suspicious TLDs, excessive subdomains, lookalike brand domains, non-HTTPS).
3. Malicious app indicators (`.apk` downloads, unknown-source instructions, AnyDesk/TeamViewer/QuickSupport).

Rule weights are capped per category to stop one clue from dominating.

### 2. Local AI models

`src/lib/aiModel.ts` runs two exported models entirely in the browser:

- **Message model:** word, bigram and character n-grams over the pasted text.
- **URL model:** character n-grams plus lexical features such as TLD, hyphens, digits, `@`, IP addresses and brand words.

The final score is `round(0.62 × rule score + 0.38 × model score)`. The model is
capped at 38% and can only add an explainable signal; it never hides or removes a
rule-based red flag. Holdout results are in [`ml/metrics.json`](ml/metrics.json):

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
| --- | ---: | ---: | ---: | ---: | ---: |
| Message | 0.814 | 1.000 | 0.802 | 0.890 | 0.986 |
| URL | 0.919 | 0.888 | 0.958 | 0.922 | 0.975 |

### Score bands

- **0–24:** Low
- **25–54:** Moderate
- **55–100:** High

No upload, login, cookie or scan history is involved. The model weights and OCR
assets are static files served with the site; your text and screenshots are
processed in memory and discarded. The only value kept in `localStorage` is the
`verifypoint-theme` preference set by the theme switcher.

## Getting started

```bash
npm install
npm run dev      # local development
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
npm test         # risk engine + AI model test suite
npm run lint     # static checks
```

### Retraining the models

The exported weights are committed, so no training is needed to use the site.
To reproduce or improve them, download the datasets listed in
[`ml/SOURCES.md`](ml/SOURCES.md) into a local folder and run:

```powershell
$env:VERIFYPOINT_DATA='C:\path\to\downloaded\files'
python ml/train_model.py
```

`ml/data/` is git-ignored so raw datasets are never published.

## Deployment

The Vite config uses `base: './'`, so the contents of `dist/` can be hosted on GitHub Pages, Vercel, Netlify or any static host.

## Disclaimer

The analyzer combines screenshot OCR, pattern heuristics and statistical models. OCR can misread text, especially in low-resolution images or unsupported scripts, and the analyzer cannot detect every cybercrime. Its scores are guidance, not proof. Always verify unexpected requests through official channels. This tool does not intercept calls or messages, analyze APK binaries, or store scan history.

## Acknowledgements

UI animation components from [React Bits](https://github.com/DavidHDev/react-bits), the OCR engine (Tesseract.js) and the licensed training datasets are credited in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Dataset details, citations and reproduction steps are in [`ml/SOURCES.md`](ml/SOURCES.md).
