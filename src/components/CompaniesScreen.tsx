import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import CompanyForm from './CompanyForm'

type CompanyRow = {
  uuid: string
  legal_name: string
  rfc: string
  fiscal_zip: string
  tax_regime: string
  cfdi_use: string
}

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('company')
      .select('uuid, legal_name, rfc, fiscal_zip, tax_regime, cfdi_use')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setCompanies((data ?? []) as CompanyRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const f = filter.trim().toLowerCase()
  const visible = f
    ? companies.filter(
        (c) =>
          c.legal_name.toLowerCase().includes(f) ||
          c.rfc.toLowerCase().includes(f)
      )
    : companies

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-3">
        <h2 className="mb-3 text-base font-semibold tracking-tight">
          Companies <span className="text-neutral-400">({visible.length})</span>
        </h2>
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or RFC"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="card max-h-[70vh] overflow-y-auto p-0">
          {loading && <p className="p-6 text-center text-sm text-neutral-400">Loading...</p>}
          {!loading && visible.length === 0 && (
            <p className="p-6 text-center text-sm text-neutral-400">No companies</p>
          )}
          <ul className="divide-y divide-neutral-100">
            {visible.map((c) => (
              <li key={c.uuid} className="px-4 py-3">
                <div className="truncate text-sm font-medium">{c.legal_name}</div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  {c.rfc} · CP {c.fiscal_zip} · {c.tax_regime} · {c.cfdi_use}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="order-first lg:order-none lg:col-span-2">
        <h2 className="mb-3 text-base font-semibold tracking-tight">New company</h2>
        <CompanyForm onCreated={load} />
      </section>
    </div>
  )
}