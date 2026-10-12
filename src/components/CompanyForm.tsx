import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { EMPTY_COMPANY, validateCompany, type CompanyData } from '../company'
import CompanyFields from './CompanyFields'

export default function CompanyForm({ onCreated }: { onCreated: () => void }) {
  const [data, setData] = useState<CompanyData>(EMPTY_COMPANY)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    const err = validateCompany(data)
    if (err) {
      setMessage(`Error: ${err}`)
      return
    }

    setSaving(true)
    const { error } = await supabase.from('company').insert({
      legal_name: data.legalName.trim(),
      rfc: data.rfc.trim().toUpperCase(),
      fiscal_zip: data.zip.trim(),
      tax_regime: data.regime,
      cfdi_use: data.cfdiUse,
    })
    setSaving(false)

    if (error) {
      setMessage(
        error.code === '23505'
          ? 'Error: that RFC already exists'
          : `Error: ${error.message}`
      )
    } else {
      setMessage('Company created')
      setData(EMPTY_COMPANY)
      onCreated()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <CompanyFields value={data} onChange={setData} />
      <button disabled={saving} className="btn-primary w-full">
        {saving ? 'Saving...' : 'Create company'}
      </button>
      {message && (
        <p className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>
          {message}
        </p>
      )}
    </form>
  )
}