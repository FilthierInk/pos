import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  EMPTY_COMPANY,
  validateCompany,
  type CompanyData,
} from '../company'
import CompanyFields from './CompanyFields'

type CompanyOption = { uuid: string; legal_name: string; rfc: string }

export default function ClientForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'own' | 'other'>('own')
  const [company, setCompany] = useState<CompanyData>(EMPTY_COMPANY)
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<CompanyOption | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase
      .from('company')
      .select('uuid, legal_name, rfc')
      .eq('is_active', true)
      .order('legal_name')
      .then(({ data }) => setCompanies((data ?? []) as CompanyOption[]))
  }, [])

  const s = search.trim().toLowerCase()
  const matches = s
    ? companies
        .filter(
          (c) =>
            c.legal_name.toLowerCase().includes(s) ||
            c.rfc.toLowerCase().includes(s)
        )
        .slice(0, 8)
    : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    let args: Record<string, string | null>

    if (mode === 'own') {
      const data = { ...company, legalName: company.legalName.trim() || name.trim() }
      const err = validateCompany(data)
      if (err) {
        setMessage(`Error: ${err}`)
        return
      }
      args = {
        p_name: name.trim(),
        p_company_uuid: null,
        p_legal_name: data.legalName,
        p_rfc: data.rfc.trim().toUpperCase(),
        p_zip: data.zip.trim(),
        p_regime: data.regime,
        p_cfdi_use: data.cfdiUse,
      }
    } else {
      if (!selected) {
        setMessage('Error: select a company')
        return
      }
      args = { p_name: name.trim(), p_company_uuid: selected.uuid }
    }

    setSaving(true)
    const { error } = await supabase.rpc('create_client', args)
    setSaving(false)

    if (error) {
      setMessage(
        error.code === '23505'
          ? 'Error: that RFC already exists. Use "Another company" and search for it'
          : `Error: ${error.message}`
      )
    } else {
      setMessage('Client created')
      setName('')
      setCompany(EMPTY_COMPANY)
      setSearch('')
      setSelected(null)
      onCreated()
    }
  }

  const radio = (value: 'own' | 'other', label: string) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="radio"
        name="mode"
        className="h-4 w-4 accent-neutral-900"
        checked={mode === value}
        onChange={() => setMode(value)}
      />
      {label}
    </label>
  )

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="label">Client name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="border-t border-neutral-100 pt-4">
        <p className="mb-2 text-xs font-medium text-neutral-500">Invoices to</p>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
          {radio('own', 'Its own data')}
          {radio('other', 'Another company')}
        </div>

        {mode === 'own' && (
          <CompanyFields
            value={company}
            onChange={setCompany}
            legalNamePlaceholder={name || undefined}
          />
        )}

        {mode === 'other' && (
          <div>
            {selected ? (
              <div className="flex items-center justify-between rounded-lg border border-neutral-300 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{selected.legal_name}</div>
                  <div className="text-xs text-neutral-500">{selected.rfc}</div>
                </div>
                <button type="button" className="btn-ghost" onClick={() => setSelected(null)}>
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  className="input"
                  placeholder="Search company by name or RFC"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {matches.length > 0 && (
                  <ul className="mt-2 divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                    {matches.map((c) => (
                      <li
                        key={c.uuid}
                        onClick={() => setSelected(c)}
                        className="cursor-pointer px-3 py-2 hover:bg-neutral-50"
                      >
                        <div className="text-sm font-medium">{c.legal_name}</div>
                        <div className="text-xs text-neutral-500">{c.rfc}</div>
                      </li>
                    ))}
                  </ul>
                )}
                {s && matches.length === 0 && (
                  <p className="mt-2 text-xs text-neutral-400">
                    No match. Create it in the Companies tab.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <button disabled={saving} className="btn-primary w-full">
        {saving ? 'Saving...' : 'Create client'}
      </button>
      {message && (
        <p className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>
          {message}
        </p>
      )}
    </form>
  )
}