export const RFC_REGEX = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/

export type CompanyData = {
  legalName: string
  rfc: string
  zip: string
  regime: string
  cfdiUse: string
}

export const EMPTY_COMPANY: CompanyData = {
  legalName: '',
  rfc: '',
  zip: '',
  regime: '',
  cfdiUse: '',
}

export function validateCompany(c: CompanyData): string | null {
  if (!c.legalName.trim()) return 'Legal name is required'
  if (!RFC_REGEX.test(c.rfc.trim().toUpperCase()))
    return 'Invalid RFC format (12 or 13 characters)'
  if (!/^[0-9]{5}$/.test(c.zip.trim())) return 'Postal code must be 5 digits'
  if (!c.regime) return 'Tax regime is required'
  if (!c.cfdiUse) return 'CFDI use is required'
  return null
}