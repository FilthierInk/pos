import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ClientForm from './ClientForm'

type ClientRow = {
  uuid: string
  name: string
  company: { legal_name: string; rfc: string } | null
}

export default function ClientsScreen() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('client')
      .select('uuid, name, company:company_uuid(legal_name, rfc)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setClients((data ?? []) as unknown as ClientRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const f = filter.trim().toLowerCase()
  const visible = f
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(f) ||
          (c.company?.legal_name ?? '').toLowerCase().includes(f) ||
          (c.company?.rfc ?? '').toLowerCase().includes(f)
      )
    : clients

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* List */}
      <section className="lg:col-span-3">
        <h2 className="mb-3 text-base font-semibold tracking-tight">
          Clients <span className="text-neutral-400">({visible.length})</span>
        </h2>
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, company or RFC"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="card max-h-[70vh] overflow-y-auto p-0">
          {loading && <p className="p-6 text-center text-sm text-neutral-400">Loading...</p>}
          {!loading && visible.length === 0 && (
            <p className="p-6 text-center text-sm text-neutral-400">No clients</p>
          )}
          <ul className="divide-y divide-neutral-100">
            {visible.map((c) => (
              <li key={c.uuid} className="px-4 py-3">
                <div className="truncate text-sm font-medium">{c.name}</div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  {c.company?.legal_name} · {c.company?.rfc}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Form */}
      <section className="order-first lg:order-none lg:col-span-2">
        <h2 className="mb-3 text-base font-semibold tracking-tight">New client</h2>
        <ClientForm onCreated={load} />
      </section>
    </div>
  )
}