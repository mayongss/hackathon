import { TripResult } from '@/types'
import LZString from 'lz-string'

export function encodeResult(result: TripResult): string {
  const json = JSON.stringify(result)
  // LZString handles compression specifically for URI params
  return LZString.compressToEncodedURIComponent(json)
}

export function decodeResult(encoded: string): TripResult | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    return JSON.parse(json) as TripResult
  } catch (error) {
    console.error('Failed to decode trip result:', error)
    return null
  }
}
