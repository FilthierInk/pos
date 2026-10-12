import { useCallback, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductForm from './ProductForm'

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('inventory')
      .select('uuid, sku, sat_code, description, suggested_price')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const f = filter.trim().toLowerCase()
  const visible = f
    ? products.filter(
        (p) =>
          p.sku.toLowerCase().includes(f) ||
          p.description.toLowerCase().includes(f)
      )
    : products

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* List */}
      <section className="lg:col-span-3">
        <h2 className="mb-3 text-base font-semibold tracking-tight">
          Products <span className="text-neutral-400">({visible.length})</span>
        </h2>
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className="input pl-9"
            placeholder="Filter by SKU or description"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="card max-h-[70vh] overflow-y-auto p-0">
          {loading && <p className="p-6 text-center text-sm text-neutral-400">Loading...</p>}
          {!loading && visible.length === 0 && (
            <p className="p-6 text-center text-sm text-neutral-400">No products</p>
          )}
          <ul className="divide-y divide-neutral-100">
            {visible.map((p) => (
              <li key={p.uuid} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{p.description}</div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    {p.sku} · SAT {p.sat_code}
                  </div>
                </div>
                <div className="text-sm font-medium">${p.suggested_price.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Form */}
      <section className="order-first lg:order-none lg:col-span-2">
        <h2 className="mb-3 text-base font-semibold tracking-tight">New product</h2>
        <ProductForm onCreated={load} />
      </section>
    </div>
  )
}