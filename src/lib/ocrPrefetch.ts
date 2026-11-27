/**
 * Lightweight local OCR prefetch. Kept separate from `ocr.ts` so Scanner can
 * warm the assets without pulling Tesseract into its chunk.
 */
import { relaxedSimd, simd } from 'wasm-feature-detect'

const CORES = {
  relaxed: 'tesseract-core-relaxedsimd-lstm',
  simd: 'tesseract-core-simd-lstm',
  baseline: 'tesseract-core-lstm',
} as const

export type CoreName = (typeof CORES)[keyof typeof CORES]

export function assetUrl(path: string): string {
  return new URL(`tesseract/${path}`, document.baseURI).href
}

/** Match Tesseract's own core selection, but with a separate JS loader and WASM file. */
export async function selectCore(): Promise<CoreName> {
  const [relaxedSimdSupported, simdSupported] = await Promise.all([relaxedSimd(), simd()])
  if (relaxedSimdSupported) return CORES.relaxed
  if (simdSupported) return CORES.simd
  return CORES.baseline
}

function prefetch(url: string): Promise<void> {
  return fetch(url, { cache: 'force-cache' })
    .then((response) => (response.ok ? response.arrayBuffer() : undefined))
    .then(() => undefined)
    .catch(() => undefined)
}

let warmPromise: Promise<void> | null = null

/** Warm the local OCR payload when the screenshot tab is approached. */
export function warmOcrAssets(): void {
  if (warmPromise) return
  warmPromise = (async () => {
    const core = await selectCore()
    await Promise.all(
      [
        assetUrl('worker.min.js'),
        assetUrl(`${core}.js`),
        assetUrl(`${core}.wasm`),
        assetUrl('eng.traineddata.gz'),
        assetUrl('hin.traineddata.gz'),
      ].map(prefetch),
    )
  })().catch(() => {
    warmPromise = null
  })
}
