/**
 * Local screenshot OCR. Tesseract's worker, core and language data are served
 * from /public/tesseract, so no image or OCR request leaves the browser.
 */
import { cleanOcrText } from './imageIntake'

type TesseractWorker = Awaited<ReturnType<typeof import('tesseract.js').createWorker>>

export interface OcrProgress {
  status: string
  progress: number
}

export interface OcrResult {
  text: string
  confidence: number
}

let workerPromise: Promise<TesseractWorker> | null = null
let progressListener: ((progress: OcrProgress) => void) | null = null

function assetUrl(path: string): string {
  return new URL(`tesseract/${path}`, document.baseURI).href
}

function getWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const tesseract = await import('tesseract.js')
      const worker = await tesseract.createWorker('eng+hin', 1, {
        workerPath: assetUrl('worker.min.js'),
        corePath: assetUrl(''),
        langPath: assetUrl(''),
        workerBlobURL: false,
        gzip: true,
        cacheMethod: 'none',
        logger: (message) => {
          progressListener?.({ status: message.status, progress: message.progress })
        },
      })
      await worker.setParameters({
        preserve_interword_spaces: '1',
        user_defined_dpi: '300',
      })
      return worker
    })().catch((error) => {
      workerPromise = null
      throw error
    })
  }
  return workerPromise
}

/** Read all readable text from a pasted or uploaded screenshot, on-device. */
export async function recognizeScreenshot(
  file: File,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrResult> {
  progressListener = onProgress ?? null
  const objectUrl = URL.createObjectURL(file)
  try {
    const worker = await getWorker()
    const { data } = await worker.recognize(objectUrl)
    return {
      text: cleanOcrText(data.text),
      // Tesseract reports confidence on a 0-100 scale; the UI uses 0-1.
      confidence: Number.isFinite(data.confidence) ? Math.min(100, Math.max(0, data.confidence)) / 100 : 0,
    }
  } catch (error) {
    workerPromise = null
    throw new Error(error instanceof Error ? error.message : 'Could not read this screenshot.')
  } finally {
    URL.revokeObjectURL(objectUrl)
    progressListener = null
  }
}
