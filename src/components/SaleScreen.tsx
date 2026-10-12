import { useEffect, useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CFDI_USES, REGIMES } from '../catalogs'
import {
  PAYMENT_METHODS,
  type CartItem,
  type Client,
  type PaymentMethod,
  type Product,
} from '../types'

export default function SaleScreen() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [clientUuid, setClientUuid] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Fiscal override for this sale only
  const [override, setOverride] = useState(false)
  const [fLegal, setFLegal] = useState('')
  const [fZip, setFZip] = useState('')
  const [fRegime, setFRegime] = useState('')
  const [fCfdi, setFCfdi] = useState('')

  useEffect(() => {
    supabase
      .from('client')
      .select('uuid, name, company:company_uuid(legal_name, fiscal_zip, tax_regime, cfdi_use)')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        const list = (data ?? []) as unknown as Client[]
        setClients(list)
        const walkIn = list.find((c) => c.name === 'Walk-in')
        setClientUuid(walkIn?.uuid ?? list[0]?.uuid ?? '')
      })
  }, [])

  useEffect(() => {
    const q = query.replace(/[%,()]/g, '').trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('inventory')
        .select('uuid, sku, sat_code, description, suggested_price, sat_unit_key, iva_rate')
        .eq('is_active', true)
        .or(`sku.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(20)
      setResults((data ?? []) as Product[])
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  function fillFromClient(uuid: string) {
    const c = clients.find((x) => x.uuid === uuid)?.company
    setFLegal(c?.legal_name ?? '')
    setFZip(c?.fiscal_zip ?? '')
    setFRegime(c?.tax_regime ?? '')
    setFCfdi(c?.cfdi_use ?? '')
  }

  function selectClient(uuid: string) {
    setClientUuid(uuid)
    setOverride(false)
  }

  function toggleOverride(on: boolean) {
    setOverride(on)
    if (on) fillFromClient(clientUuid)
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const found = prev.find((i) => i.product.uuid === product.uuid)
      if (found) {
        return prev.map((i) =>
          i.product.uuid === product.uuid ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, unit_price: product.suggested_price, quantity: 1 }]
    })
  }

  function updateItem(uuid: string, patch: Partial<CartItem>) {
    setCart((prev) =>
      prev.map((i) => (i.product.uuid === uuid ? { ...i, ...patch } : i))
    )
  }

  function removeItem(uuid: string) {
    setCart((prev) => prev.filter((i) => i.product.uuid !== uuid))
  }

  // Preview only: the real total is computed in the database
  const previewTotal = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0)

  async function saveSale() {
    if (cart.length === 0 || !clientUuid) return

    if (override && fZip.trim() && !/^[0-9]{5}$/.test(fZip.trim())) {
      setMessage('Error: postal code must be 5 digits')
      return
    }

    setSaving(true)
    setMessage('')
    const { error } = await supabase.rpc('create_sale', {
      p_client_uuid: clientUuid,
      p_payment_method: payment,
      p_items: cart.map((i) => ({
        product_uuid: i.product.uuid,
        unit_price: i.unit_price,
        quantity: i.quantity,
      })),
      p_legal_name: override ? fLegal : null,
      p_zip: override ? fZip : null,
      p_regime: override ? fRegime : null,
      p_cfdi_use: override ? fCfdi : null,
    })
    setSaving(false)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Sale saved')
      setCart([])
      setQuery('')
      setResults([])
      setOverride(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Search */}
      <section className="lg:col-span-2">
        <h2 className="mb-3 text-base font-semibold tracking-tight">Products</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className="input pl-9"
            placeholder="Search by SKU or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {results.length > 0 && (
          <ul className="card mt-2 divide-y divide-neutral-100 p-0">
            {results.map((p) => (
              <li
                key={p.uuid}
                onClick={() => addToCart(p)}
                className="cursor-pointer px-4 py-3 transition hover:bg-neutral-50"
              >
                <div className="text-sm font-medium">{p.description}</div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  {p.sku} · SAT {p.sat_code} · ${p.suggested_price.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sale */}
      <section className="lg:col-span-3">
        <h2 className="mb-3 text-base font-semibold tracking-tight">Sale</h2>

        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Client</label>
            <select
              className="input"
              value={clientUuid}
              onChange={(e) => selectClient(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c.uuid} value={c.uuid}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Payment method</label>
            <select
              className="input capitalize"
              value={payment}
              onChange={(e) => setPayment(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fiscal override */}
        <div className="mb-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              className="h-4 w-4 accent-neutral-900"
              checked={override}
              onChange={(e) => toggleOverride(e.target.checked)}
            />
            Edit fiscal data for this sale
          </label>

          {override && (
            <div className="card mt-2 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Legal name</label>
                <input className="input" value={fLegal} onChange={(e) => setFLegal(e.target.value)} />
              </div>
              <div>
                <label className="label">Fiscal postal code</label>
                <input
                  className="input"
                  maxLength={5}
                  inputMode="numeric"
                  value={fZip}
                  onChange={(e) => setFZip(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Tax regime</label>
                <select className="input" value={fRegime} onChange={(e) => setFRegime(e.target.value)}>
                  <option value="">Use company's</option>
                  {REGIMES.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">CFDI use</label>
                <select className="input" value={fCfdi} onChange={(e) => setFCfdi(e.target.value)}>
                  <option value="">Use company's</option>
                  {CFDI_USES.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-neutral-400 sm:col-span-2">
                Empty fields use the company's data. These values are saved on this sale only.
              </p>
            </div>
          )}
        </div>

        <div className="card space-y-3">
          {cart.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-400">
              Search and tap a product to add it
            </p>
          )}

          {cart.map((i) => (
            <div key={i.product.uuid} className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{i.product.description}</div>
                  <div className="text-xs text-neutral-500">{i.product.sku}</div>
                </div>
                <button
                  onClick={() => removeItem(i.product.uuid)}
                  className="text-neutral-400 transition hover:text-red-600"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-3 items-end gap-3">
                <div>
                  <label className="label">Qty</label>
                  <input
                    type="number"
                    min={1}
                    className="input"
                    value={i.quantity}
                    onChange={(e) =>
                      updateItem(i.product.uuid, {
                        quantity: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="label">Unit price</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input"
                    value={i.unit_price}
                    onChange={(e) =>
                      updateItem(i.product.uuid, {
                        unit_price: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                  />
                </div>
                <div className="pb-2 text-right text-sm font-medium">
                  ${(i.unit_price * i.quantity).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500">Total</div>
            <div className="text-2xl font-semibold tracking-tight">
              ${previewTotal.toFixed(2)}
            </div>
          </div>
          <button
            onClick={saveSale}
            disabled={saving || cart.length === 0}
            className="btn-primary px-6 py-3"
          >
            {saving ? 'Saving...' : 'Save sale'}
          </button>
        </div>
        {message && (
          <p className={`text-sm mt-2 ${message.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>
            {message}
          </p>
        )}
      </section>
    </div>
  )
}