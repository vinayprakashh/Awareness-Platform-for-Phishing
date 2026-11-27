#!/usr/bin/env python3
"""
Train the compact classifiers used by SafeSignal's browser-side AI screening.

The models are deliberately small: TF-IDF over word/character n-grams plus a
logistic-regression classifier, exported as JSON weights so inference can run
entirely in the browser with no network requests and no user-data upload.

Raw datasets are NOT committed. Put the downloaded CSV/JSONL files in ./data
(or point SAFESIGNAL_DATA at another folder) and run:

    python ml/train_model.py

See ml/SOURCES.md for provenance and licences.
"""
from __future__ import annotations

import csv
import json
import math
import os
import random
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Callable, Iterable, Sequence

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(os.environ.get("SAFESIGNAL_DATA", str(Path(__file__).resolve().parent / "data")))
OUT = ROOT / "src" / "ml"
SEED = 20261127

csv.field_size_limit(sys.maxsize)
random.seed(SEED)
np.random.seed(SEED)

# ---------------------------------------------------------------------------
# Feature extraction. The TypeScript inference module mirrors these functions
# exactly; keep the two implementations in sync when changing them.
# ---------------------------------------------------------------------------

WORD_RE = re.compile(r"[a-z]{2,}|\d{2,}")
PLACEHOLDER_RE = re.compile(r"<[^>]{1,40}>")
URL_RE = re.compile(r"https?://\S+")
SPACE_RE = re.compile(r"\s+")


def normalise_text(raw: str) -> str:
    text = PLACEHOLDER_RE.sub(" ", raw or "")
    text = URL_RE.sub(" urltoken ", text)
    text = SPACE_RE.sub(" ", text.lower()).strip()
    return text[:1200]


def text_features(raw: str) -> list[str]:
    norm = normalise_text(raw)
    words = WORD_RE.findall(norm)[:180]
    features = [f"w:{word}" for word in words]
    features.extend(f"b:{a}_{b}" for a, b in zip(words, words[1:]))
    features.extend(f"c:{norm[i:i + n]}" for n in (3, 4) for i in range(max(0, len(norm) - n + 1)))
    return features


SUSPICIOUS_TLDS = {
    "xyz", "top", "click", "country", "loan", "work", "cyou", "live", "icu",
    "gq", "cf", "tk", "ml", "ga", "zip", "mov", "rest", "monster", "bond",
}
BRAND_WORDS = re.compile(
    r"paypal|bank|sbi|hdfc|icici|axis|kotak|upi|kyc|verify|secure|login|account|"
    r"amazon|netflix|gov|incometax|whatsapp|apple|microsoft|delivery|parcel"
)


def normalise_url(raw: str) -> str:
    return re.sub(r"\s+", "", (raw or "").lower())[:240]


def url_features(raw: str) -> list[str]:
    url = normalise_url(raw)
    features = [f"c:{url[i:i + n]}" for n in (3, 4, 5) for i in range(max(0, len(url) - n + 1))]

    host = url.split("//", 1)[-1].split("/", 1)[0].split("@")[-1].split(":", 1)[0]
    tld = host.rsplit(".", 1)[-1] if "." in host else ""
    digits = sum(ch.isdigit() for ch in url)
    length = len(url)

    features.extend([
        f"L:{length // 10}",
        f"D:{min(digits // 3, 20)}",
        f"H:{min(url.count('-'), 8)}",
        f"P:{min(url.count('.'), 12)}",
        f"A:{min(url.count('@'), 3)}",
        f"Q:{min(url.count('?'), 3)}",
        f"S:{min(url.count('/') - 2, 12)}",
        f"T:{tld}" if tld and len(tld) <= 8 else "T:other",
        "F:http" if url.startswith("http://") else "F:https",
        "I:yes" if re.fullmatch(r"(?:\d{1,3}\.){3}\d{1,3}", host) else "I:no",
        "B:yes" if BRAND_WORDS.search(url) else "B:no",
        "X:yes" if tld in SUSPICIOUS_TLDS else "X:no",
        "U:yes" if "xn--" in host else "U:no",
    ])
    return features


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

TextExample = tuple[str, int, str]  # text, label (1 = scam), source


def _read_csv(name: str, required: Sequence[str]) -> Iterable[dict[str, str]]:
    path = DATA / name
    if not path.exists():
        print(f"  ! skipping missing {name}", file=sys.stderr)
        return
    with path.open("r", encoding="utf-8-sig", errors="replace", newline="") as fh:
        reader = csv.DictReader(fh)
        if not reader.fieldnames or not set(required).issubset(reader.fieldnames):
            print(f"  ! unexpected columns in {name}: {reader.fieldnames}", file=sys.stderr)
            return
        yield from reader


def load_text_data(cap_positives: int = 26000) -> tuple[list[TextExample], list[TextExample]]:
    positives: list[TextExample] = []
    negatives: list[TextExample] = []

    for row in _read_csv("smishing_imc25.csv", ("text", "translation")):
        text = (row.get("translation") or row.get("text") or "").strip()
        if text:
            positives.append((text, 1, "reportsmishing/Smishing-Dataset-IMC25"))

    for row in _read_csv("sms_phishing.csv", ("message",)):
        text = (row.get("message") or "").strip()
        if text:
            positives.append((text, 1, "wspr-ncsu/sms-phishing"))

    for row in _read_csv("india_spam_ham.csv", ("Msg", "Label")):
        text = (row.get("Msg") or "").strip()
        label = 1 if (row.get("Label") or "").strip().lower() == "spam" else 0
        if text:
            (positives if label else negatives).append((text, label, "junioralive/india-spam-sms-classification"))

    path = DATA / "digital_arrest.jsonl"
    if path.exists():
        for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            if not line.strip():
                continue
            obj = json.loads(line)
            text = (obj.get("text") or "").strip()
            if not text:
                continue
            label = 1 if obj.get("expected_state") == "likely" else 0
            (positives if label else negatives).append((text, label, "rajatnagda45/doosri-raay"))
    else:
        print("  ! skipping missing digital_arrest.jsonl", file=sys.stderr)

    # Cap the very large positive pool while keeping every source represented.
    by_source: dict[str, list[TextExample]] = {}
    for example in positives:
        by_source.setdefault(example[2], []).append(example)
    kept: list[TextExample] = []
    for source, items in by_source.items():
        share = max(1, round(cap_positives * len(items) / len(positives)))
        kept.extend(random.sample(items, min(share, len(items))))
    positives = kept[:cap_positives]

    return positives, negatives


UrlExample = tuple[str, int]  # url, label (1 = phishing)


def load_url_data(cap: int = 70000) -> list[UrlExample]:
    examples: list[UrlExample] = []
    for row in _read_csv("balanced_urls.csv", ("url", "label")):
        url = (row.get("url") or "").strip()
        label = 1 if (row.get("label") or "").strip().lower() == "phishing" else 0
        if url:
            examples.append((url, label))
    random.shuffle(examples)
    return examples[:cap]


# ---------------------------------------------------------------------------
# TF-IDF vectorisation
# ---------------------------------------------------------------------------

def build_vocab(
    texts: Sequence[str],
    feature_fn: Callable[[str], list[str]],
    max_features: int,
) -> tuple[list[str], np.ndarray, dict[str, int]]:
    df: Counter[str] = Counter()
    for text in texts:
        df.update(set(feature_fn(text)))
    terms = [term for term, _ in df.most_common(max_features)]
    index = {term: i for i, term in enumerate(terms)}
    n_docs = max(1, len(texts))
    idf = np.array([math.log((1 + n_docs) / (1 + df[term])) + 1 for term in terms], dtype=np.float32)
    return terms, idf, index


def vectorise(
    texts: Sequence[str],
    feature_fn: Callable[[str], list[str]],
    index: dict[str, int],
    idf: np.ndarray,
) -> list[tuple[np.ndarray, np.ndarray]]:
    rows: list[tuple[np.ndarray, np.ndarray]] = []
    for text in texts:
        counts = Counter(index[t] for t in feature_fn(text) if t in index)
        if not counts:
            rows.append((np.empty(0, dtype=np.int32), np.empty(0, dtype=np.float32)))
            continue
        inds = np.fromiter(counts.keys(), dtype=np.int32)
        vals = np.fromiter((1.0 + math.log(c) for c in counts.values()), dtype=np.float32)
        vals *= idf[inds]
        norm = float(np.linalg.norm(vals))
        if norm > 0:
            vals /= norm
        rows.append((inds, vals))
    return rows


# ---------------------------------------------------------------------------
# Logistic regression trained with mini-batch SGD (sparse updates)
# ---------------------------------------------------------------------------

def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.clip(x, -30, 30)))


def train_sgd(
    rows: list[tuple[np.ndarray, np.ndarray]],
    labels: np.ndarray,
    weights: np.ndarray,
    n_features: int,
    epochs: int = 8,
    lr: float = 0.25,
    l2: float = 2e-5,
    batch: int = 256,
) -> tuple[np.ndarray, float]:
    w = np.zeros(n_features, dtype=np.float32)
    bias = 0.0
    n = len(rows)

    for epoch in range(epochs):
        rate = lr / (1.0 + 0.45 * epoch)
        order = np.random.permutation(n)
        for start in range(0, n, batch):
            batch_idx = order[start:start + batch]
            size = len(batch_idx)
            idx_parts: list[np.ndarray] = []
            val_parts: list[np.ndarray] = []
            row_parts: list[np.ndarray] = []
            for row_no, doc in enumerate(batch_idx):
                inds, vals = rows[doc]
                idx_parts.append(inds)
                val_parts.append(vals)
                row_parts.append(np.full(len(inds), row_no, dtype=np.int32))
            if not idx_parts:
                continue
            idx = np.concatenate(idx_parts)
            val = np.concatenate(val_parts)
            row_of = np.concatenate(row_parts)

            logits = np.zeros(size, dtype=np.float32)
            np.add.at(logits, row_of, w[idx] * val)
            logits += bias
            grad = (sigmoid(logits) - labels[batch_idx]) * weights[batch_idx] / size

            grad_w = np.zeros(n_features, dtype=np.float32)
            np.add.at(grad_w, idx, grad[row_of] * val)
            w -= rate * (grad_w + l2 * w)
            bias -= rate * float(grad.sum())

        preds = predict_proba(rows, w, bias)
        loss = -np.mean(
            labels * np.log(np.clip(preds, 1e-6, 1)) + (1 - labels) * np.log(np.clip(1 - preds, 1e-6, 1))
        )
        print(f"    epoch {epoch + 1}/{epochs}  loss={loss:.4f}", flush=True)
    return w, bias


def predict_proba(rows: Sequence[tuple[np.ndarray, np.ndarray]], w: np.ndarray, bias: float) -> np.ndarray:
    out = np.empty(len(rows), dtype=np.float32)
    for i, (inds, vals) in enumerate(rows):
        out[i] = float(w[inds] @ vals) + bias
    return sigmoid(out)


def auc_score(y: np.ndarray, p: np.ndarray) -> float:
    order = np.argsort(p)
    ranks = np.empty(len(p), dtype=np.float64)
    sorted_p = p[order]
    i = 0
    while i < len(p):
        j = i
        while j + 1 < len(p) and sorted_p[j + 1] == sorted_p[i]:
            j += 1
        ranks[order[i:j + 1]] = (i + j) / 2 + 1
        i = j + 1
    n_pos = int(y.sum())
    n_neg = len(y) - n_pos
    if not n_pos or not n_neg:
        return 0.5
    return float((ranks[y == 1].sum() - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg))


def metrics(y: np.ndarray, p: np.ndarray, threshold: float = 0.5) -> dict[str, float]:
    pred = (p >= threshold).astype(np.int8)
    tp = int(((pred == 1) & (y == 1)).sum())
    fp = int(((pred == 1) & (y == 0)).sum())
    fn = int(((pred == 0) & (y == 1)).sum())
    tn = int(((pred == 0) & (y == 0)).sum())
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "accuracy": round((tp + tn) / len(y), 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "rocAuc": round(auc_score(y, p), 4),
        "truePositives": tp,
        "falsePositives": fp,
        "falseNegatives": fn,
        "trueNegatives": tn,
        "threshold": threshold,
    }


def export(name: str, terms: list[str], idf: np.ndarray, w: np.ndarray, bias: float,
           config: dict, result: dict) -> dict:
    payload = {
        "version": 1,
        "name": name,
        "config": config,
        "vocab": terms,
        "idf": [round(float(v), 5) for v in idf],
        "weights": [round(float(v), 5) for v in w],
        "bias": round(float(bias), 5),
        "metrics": result,
    }
    target = OUT / f"{name}_model.json"
    target.write_text(json.dumps(payload, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    print(f"  -> {target.relative_to(ROOT)} ({target.stat().st_size:,} bytes)")
    return {k: v for k, v in result.items()}


def train_text() -> dict:
    print("\n[1/2] Text / smishing classifier")
    positives, negatives = load_text_data()
    examples = positives + negatives
    labels = np.array([e[1] for e in examples], dtype=np.int8)
    y_float = labels.astype(np.float32)

    # Balance the effective loss: the phishing corpora are much larger than
    # the clean-SMS corpora, so up-weight the scarce benign examples.
    pos_n, neg_n = int((labels == 1).sum()), int((labels == 0).sum())
    weights = np.where(labels == 1, 1.0, pos_n / max(1, neg_n)).astype(np.float32)
    weights /= float(weights.mean())
    print(f"  samples: {len(examples):,} ({pos_n:,} scam / {neg_n:,} benign), weight[benign]={pos_n / max(1, neg_n):.1f}x")

    random.shuffle(examples)
    # Re-derive labels/weights to follow the shuffle.
    labels = np.array([e[1] for e in examples], dtype=np.int8)
    y_float = labels.astype(np.float32)
    weights = np.where(labels == 1, 1.0, pos_n / max(1, neg_n)).astype(np.float32)
    weights /= float(weights.mean())

    split = int(len(examples) * 0.85)
    train_texts = [e[0] for e in examples[:split]]
    test_texts = [e[0] for e in examples[split:]]
    y_train, y_test = y_float[:split], y_float[split:]

    terms, idf, index = build_vocab(train_texts, text_features, 7000)
    print(f"  vocabulary: {len(terms):,} features")
    train_rows = vectorise(train_texts, text_features, index, idf)
    test_rows = vectorise(test_texts, text_features, index, idf)

    w, bias = train_sgd(train_rows, y_train, weights[:split], len(terms), epochs=16)
    probs = predict_proba(test_rows, w, bias)
    result = metrics(y_test.astype(np.int8), probs)
    print("  test:", {k: v for k, v in result.items() if not isinstance(v, int)})
    return export(
        "text",
        terms, idf, w, bias,
        {"analysis": "word1-word2-char3-char4", "maxFeatures": len(terms), "trainedOn": len(train_texts),
         "sources": sorted({e[2] for e in examples})},
        result,
    )


def train_url() -> dict:
    print("\n[2/2] URL / deceptive-link classifier")
    examples = load_url_data()
    labels = np.array([e[1] for e in examples], dtype=np.int8)
    y_float = labels.astype(np.float32)
    print(f"  samples: {len(examples):,} ({int(labels.sum()):,} phishing / {len(labels) - int(labels.sum()):,} legitimate)")

    split = int(len(examples) * 0.85)
    train_urls = [e[0] for e in examples[:split]]
    test_urls = [e[0] for e in examples[split:]]
    y_train, y_test = y_float[:split], y_float[split:]
    ones = np.ones(len(train_urls), dtype=np.float32)

    terms, idf, index = build_vocab(train_urls, url_features, 9000)
    print(f"  vocabulary: {len(terms):,} features")
    train_rows = vectorise(train_urls, url_features, index, idf)
    test_rows = vectorise(test_urls, url_features, index, idf)

    w, bias = train_sgd(train_rows, y_train, ones, len(terms), epochs=10, lr=0.3)
    probs = predict_proba(test_rows, w, bias)
    result = metrics(y_test.astype(np.int8), probs)
    print("  test:", {k: v for k, v in result.items() if not isinstance(v, int)})
    return export(
        "url",
        terms, idf, w, bias,
        {"analysis": "char3-char5-lexical", "maxFeatures": len(terms), "trainedOn": len(train_urls),
         "sources": ["Hassan-Albattra/URL_Phishing_Detection_Dataset"]},
        result,
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    if not DATA.exists():
        raise SystemExit(f"Dataset folder not found: {DATA}\nSet SAFESIGNAL_DATA or copy files into ml/data.")
    text_metrics = train_text()
    url_metrics = train_url()
    report = {
        "generatedBy": "ml/train_model.py",
        "randomSeed": SEED,
        "framework": "NumPy TF-IDF + logistic regression (mini-batch SGD)",
        "privacy": "Inference runs locally in the browser; raw datasets are not distributed.",
        "models": {"text": text_metrics, "url": url_metrics},
    }
    target = ROOT / "ml" / "metrics.json"
    target.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"\nWrote {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
