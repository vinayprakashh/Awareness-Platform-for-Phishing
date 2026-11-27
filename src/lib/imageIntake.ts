/** Validation and cleanup for pasted/uploaded screenshots. All work is local. */

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024

export function imageIssue(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'That file is not an image. Use a PNG, JPEG, WebP or screenshot.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'That image is larger than 12 MB. Try a smaller screenshot.'
  }
  if (file.size === 0) {
    return 'That image is empty. Try again.'
  }
  return null
}

export function firstImageFile(items: FileList | File[] | null | undefined): File | null {
  if (!items) return null
  for (const file of Array.from(items)) {
    if (file.type.startsWith('image/')) return file
  }
  return null
}

/** Pull the first image out of a clipboard paste event. */
export function firstClipboardImage(items: DataTransferItemList | null | undefined): File | null {
  if (!items) return null
  for (const item of Array.from(items)) {
    if (item.kind !== 'file') continue
    const file = item.getAsFile()
    if (file?.type.startsWith('image/')) return file
  }
  return null
}

/** Normalise OCR output without rewriting the evidence it found. */
export function cleanOcrText(raw: string): string {
  return (raw ?? '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
