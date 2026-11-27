import { describe, expect, it } from 'vitest'
import { cleanOcrText, firstImageFile, imageIssue, MAX_IMAGE_BYTES } from './imageIntake'

function image(name: string, size = 1000): File {
  const file = new File(['x'], name, { type: 'image/png' })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('image intake', () => {
  it('accepts normal images and rejects oversized or non-image files', () => {
    expect(imageIssue(image('shot.png'))).toBeNull()
    expect(imageIssue(image('huge.png', MAX_IMAGE_BYTES + 1))).toContain('12 MB')
    expect(imageIssue(new File(['x'], 'notes.txt', { type: 'text/plain' }))).toContain('not an image')
  })

  it('finds the first image in a mixed clipboard or drop list', () => {
    const files = [new File(['x'], 'notes.txt', { type: 'text/plain' }), image('shot.png')]
    expect(firstImageFile(files)?.name).toBe('shot.png')
    expect(firstImageFile([])).toBeNull()
  })

  it('cleans OCR whitespace while preserving line breaks', () => {
    expect(cleanOcrText('  URGENT   text\n\n\nclick  now  ')).toBe('URGENT text\n\nclick now')
  })
})
