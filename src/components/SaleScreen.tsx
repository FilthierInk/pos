import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
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

  // Load active clients; default to Walk-in
  useEffect(() => {
    supabase
      .from('client')
      .select('uuid, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        const list = (data ?? []) as Client[]
        setClients(list)
        const walkIn = list.find((c) => c.name === 'Walk-in')
        setClientUuid(walkIn?.uuid ?? list[0]?.uuid ?? '')
      })
  }, [])

  // Debounced product search
  useEffect(() => {
    const q = query.replace(/[%,()]/g, '').trim()
    if (q.length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('inventory')
        .select('uuid, sku, sat_code, description, suggested_price')
        .eq('is_active', true)
        .or(`sku.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(20)
      setResults((data ?? []) as Product[])
    }, 300)
    return () => clearTimeout(t)
  }, [query])

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
    })
    setSaving(false)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Sale saved')
      setCart([])
      setQuery('')
      setResults([])
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-6">
      {/* Search */}
      <section>
        <h2 className="font-bold mb-2">Search product</h2>
        <input
          className="border rounded w-full p-2"
          placeholder="SKU or description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="mt-2 divide-y border rounded bg-white">
          {results.map((p) => (
            <li
              key={p.uuid}
              onClick={() => addToCart(p)}
              className="p-2 cursor-pointer hover:bg-blue-50"
            >
              <div className="font-medium">{p.description}</div>
              <div className="text-sm text-gray-500">
                {p.sku} · SAT {p.sat_code} · ${p.suggested_price.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Sale */}
      <section>
        <h2 className="font-bold mb-2">Sale</h2>

        <div className="flex gap-2 mb-3">
          <select
            className="border rounded p-2 flex-1"
            value={clientUuid}
            onChange={(e) => setClientUuid(e.target.value)}
          >
            {clients.map((c) => (
              <option key={c.uuid} value={c.uuid}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2"
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

        <table className="w-full text-sm bg-white border rounded">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="p-2">Product</th>
              <th className="p-2 w-20">Qty</th>
              <th className="p-2 w-28">Price</th>
              <th className="p-2 w-24 text-right">Subtotal</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cart.map((i) => (
              <tr key={i.product.uuid} className="border-t">
                <td className="p-2">{i.product.description}</td>
                <td className="p-2">
                  <input
                    type="number"
                    min={1}
                    className="border rounded w-full p-1"
                    value={i.quantity}
                    onChange={(e) =>
                      updateItem(i.product.uuid, {
                        quantity: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="border rounded w-full p-1"
                    value={i.unit_price}
                    onChange={(e) =>
                      updateItem(i.product.uuid, {
                        unit_price: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                  />
                </td>
                <td className="p-2 text-right">
                  ${(i.unit_price * i.quantity).toFixed(2)}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => removeItem(i.product.uuid)}
                    className="text-red-600"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-3">
          <div className="text-lg font-bold">Total: ${previewTotal.toFixed(2)}</div>
          <button
            onClick={saveSale}
            disabled={saving || cart.length === 0}
            className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save sale'}
          </button>
        </div>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </section>
    </div>
  )
}