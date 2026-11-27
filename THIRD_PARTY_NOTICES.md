# Third-party notices

## React Bits

This project includes UI components from [React Bits](https://github.com/DavidHDev/react-bits) by David Haz, used as part of this website:

- `Aurora` (animated hero background)
- `BlurText` (animated hero text)
- `SpotlightCard` (awareness guide cards)
- `StarBorder` (analyzer call-to-action)
- `ClickSpark` (subtle click feedback in the analyzer)

License: **MIT + Commons Clause License Condition v1.0**, Copyright (c) 2026 David Haz.
The full license text is included at [`src/components/react-bits/LICENSE.md`](src/components/react-bits/LICENSE.md).

The components are used inside this application and are not sold, sublicensed or redistributed as a standalone component pack.

## AI training datasets

The local message and URL classifiers were trained on public GitHub datasets under permissive licences:

- [`reportsmishing/Smishing-Dataset-IMC25`](https://github.com/reportsmishing/Smishing-Dataset-IMC25) — **CC BY 4.0**; cite Agarwal et al., *IMC '25*.
- [`junioralive/india-spam-sms-classification`](https://github.com/junioralive/india-spam-sms-classification) — **MIT**.
- [`wspr-ncsu/sms-phishing`](https://github.com/wspr-ncsu/sms-phishing) — **MIT**; cite Nahapetyan et al., *IEEE S&P 2024*.
- [`rajatnagda45/doosri-raay`](https://github.com/rajatnagda45/doosri-raay) — **MIT**.
- [`Hassan-Albattra/URL_Phishing_Detection_Dataset`](https://github.com/Hassan-Albattra/URL_Phishing_Detection_Dataset) — **MIT**.

Exact file URLs, row counts, papers, excluded unlicensed/copyleft sources and
reproduction steps are recorded in [`ml/SOURCES.md`](ml/SOURCES.md). Only exported
numeric weights are distributed; raw datasets are not committed.

Other runtime dependencies (React, Vite, Tailwind CSS, motion, lucide-react, Vitest) are used under their respective open-source licenses.
