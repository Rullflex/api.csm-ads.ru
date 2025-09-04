// Utility function to recursively normalize values in objects and arrays
export function normalizeValues(value: any): any {
  if (Array.isArray(value)) {
    return value.map(normalizeValues)
  }
  if (value !== null && typeof value === 'object') {
    const normalized: Record<string, any> = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        normalized[key] = normalizeValues(value[key])
      }
    }
    return normalized
  }
  if (typeof value === 'string') {
    if (value === 'true')
      return true
    if (value === 'false')
      return false
    // Check if it's a number (integer or float)
    if (!Number.isNaN(Number(value)) && value.trim() !== '') {
      return Number(value)
    }
    return value
  }
  return value
}
