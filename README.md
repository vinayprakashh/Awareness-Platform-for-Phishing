# SafeSignal — Cyber Security Awareness Platform

A lightweight, browser-based web app that checks suspicious messages, call transcripts and links for phishing, digital arrest scams and malicious apps. It returns a 0–100 risk score, an explainable list of red flags, and clear next steps with official Indian cybercrime reporting channels.

Built from the product requirements document for **Project #19** and uses selected [React Bits](https://github.com/DavidHDev/react-bits) components for the UI.

## Features

- **Instant analyzer (FR-01, FR-02):** paste text, a URL or a call script and get a score in milliseconds.
- **Explainable red flags (FR-03):** each detected trigger is shown with the exact matched text, why it matters and its category.
- **Threat guides (FR-04):** plain-language modules for phishing, digital arrest scams and malicious apps with real-world examples.
- **Safety checklist & helplines (FR-05):** five-step checklist, official channels (1930, cybercrime.gov.in, 112, 14567) and guidance if you already paid.
- **Sample scam simulator (FR-06):** one-tap examples covering scams and a benign message.
- **Privacy-first:** analysis runs entirely in the browser in memory. Nothing is stored or sent to a server. No login.
- **Accessible & responsive:** mobile-first layout, high-contrast green/amber/red indicators, keyboard-friendly controls and reduced-motion support.

## Detection logic

`src/lib/riskEngine.ts` contains a structured ruleset that checks:

1. High-risk keywords and intent (digital arrest, CBI/ED impersonation, urgency, credential requests, advance fees, secrecy).
2. Deceptive URLs (raw IP addresses, shorteners, suspicious TLDs, excessive subdomains, lookalike brand domains, non-HTTPS).
3. Malicious app indicators (`.apk` downloads, unknown-source instructions, AnyDesk/TeamViewer/QuickSupport).

Weights are capped per category and combined into a 0–100 score:

- **0–24:** Low
- **25–54:** Moderate
- **55–100:** High

## Getting started

```bash
npm install
npm run dev      # local development
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
npm test         # risk engine test suite
```

## Deployment

The Vite config uses `base: './'`, so the contents of `dist/` can be hosted on GitHub Pages, Vercel, Netlify or any static host.

## Disclaimer

The engine uses pattern-based heuristics. It can miss new scams and may flag harmless text. Always verify unexpected requests through official channels. This tool does not intercept calls or messages, analyze APK binaries, or store scan history.

## Acknowledgements

UI animation components from [React Bits](https://github.com/DavidHDev/react-bits) are used under the MIT + Commons Clause license. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
