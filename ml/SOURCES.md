# Training data provenance

SafeSignal's browser-side AI models were trained on the following **public GitHub
datasets with explicit licences**. Raw dataset files are **not committed**;
only the exported numeric weights (`src/ml/*_model.json`) and holdout metrics
(`ml/metrics.json`) are included in this repository.

## Datasets used

| Dataset | Source file | Rows | Licence | Used for |
| --- | --- | ---: | --- | --- |
| [Smishing Dataset IMC25](https://github.com/reportsmishing/Smishing-Dataset-IMC25) | [`dataset/final_dataset_output.csv`](https://raw.githubusercontent.com/reportsmishing/Smishing-Dataset-IMC25/main/dataset/final_dataset_output.csv) | 33,869 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Multilingual smishing examples (English translation preferred, original text as fallback). |
| [India Spam SMS Classification](https://github.com/junioralive/india-spam-sms-classification) | [`dataset/spam_ham_india.csv`](https://raw.githubusercontent.com/junioralive/india-spam-sms-classification/main/dataset/spam_ham_india.csv) | 2,267 | [MIT](https://github.com/junioralive/india-spam-sms-classification/blob/main/LICENSE) | Indian spam (`spam`) and benign (`ham`) SMS messages. |
| [SMS Phishing Data](https://github.com/wspr-ncsu/sms-phishing) | [`phishing_messages.csv`](https://raw.githubusercontent.com/wspr-ncsu/sms-phishing/main/phishing_messages.csv) | 68,029 | [MIT](https://github.com/wspr-ncsu/sms-phishing/blob/main/LICENSE) | Real phishing SMS messages reported to research gateways. |
| [Doosri Raay evaluation set](https://github.com/rajatnagda45/doosri-raay) | [`eval/items.jsonl`](https://raw.githubusercontent.com/rajatnagda45/doosri-raay/main/eval/items.jsonl) | 70 | [MIT](https://github.com/rajatnagda45/doosri-raay/blob/main/LICENSE) | Indian digital-arrest, KYC, courier and UPI pretexts; includes 21 benign controls. |
| [URL Phishing Detection Dataset](https://github.com/Hassan-Albattra/URL_Phishing_Detection_Dataset) | [`balanced_urls.csv`](https://raw.githubusercontent.com/Hassan-Albattra/URL_Phishing_Detection_Dataset/main/balanced_urls.csv) | 340,000 | [MIT](https://github.com/Hassan-Albattra/URL_Phishing_Detection_Dataset/blob/main/LICENSE) | Balanced phishing/legitimate URLs; 70,000 sampled for the link model. |

### Required citations

- Agarwal, Sharad; Papasavva, Antonis; Suarez-Tangil, Guillermo; Vasek, Marie.
  "Fishing for Smishing: Understanding SMS Phishing Infrastructure and Strategies
  by Mining Public User Reports." *IMC '25*, 2025.
  [doi:10.1145/3730567.3764431](https://doi.org/10.1145/3730567.3764431).
- Nahapetyan, Aleksandr; Prasad, Sathvik; Childs, Kevin; Oest, Adam; Ladwig,
  Yeganeh; Kapravelos, Alexandros; Reaves, Bradley. "On SMS Phishing Tactics and
  Infrastructure." *IEEE Symposium on Security and Privacy*, 2024.
- Doosri Raay contributors, 2026 (MIT).
- Hassan-Albattra, *URL Phishing Detection Dataset*, 2023–2024 (MIT).

## Reproducing the training

1. Download the files above into a local folder (for example `ml/data/` or a
   temporary directory). This folder is git-ignored.
2. Run:

   ```powershell
   $env:SAFESIGNAL_DATA='C:\path\to\downloaded\files'
   python ml/train_model.py
   ```

The script trains a TF-IDF + logistic-regression classifier in pure NumPy
(`sklearn` is not required), writes `src/ml/text_model.json`,
`src/ml/url_model.json` and `ml/metrics.json`, and uses a fixed random seed
(`20261127`) for reproducibility.

## Sources evaluated but not used

- `shaghayegh-hp/Smishing_Dataset` — no licence file found.
- `GregaVrbancic/Phishing-Dataset` — no licence file found.
- `deepchecks/deepchecks` — AGPL-3.0 copyleft licence; not appropriate for this
  static client-side distribution.

No raw message, URL, phone number or personal identifier from these datasets is
shipped in the site. The exported files contain only vocabulary terms, IDF
weights and classifier coefficients.
