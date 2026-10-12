import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProductForm() {
  const [sku, setSku] = useState('')
  const [satCode, setSatCode] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase.from('inventory').insert({
      sku: sku.trim(),
      sat_code: satCode.trim(),
      description: description.trim(),
      suggested_price: parseFloat(price) || 0,
    })

    setSaving(false)
    if (error) {
      setMessage(
        error.code === '23505'
          ? 'Error: that SKU already exists'
          : `Error: ${error.message}`
      )
    } else {
      setMessage('Product created')
      setSku('')
      setSatCode('')
      setDescription('')
      setPrice('')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="font-bold mb-3">New product</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-3">
        <input
          className="border rounded w-full p-2"
          placeholder="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          required
        />
        <input
          className="border rounded w-full p-2"
          placeholder="SAT code"
          value={satCode}
          onChange={(e) => setSatCode(e.target.value)}
          required
        />
        <input
          className="border rounded w-full p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          min={0}
          step="0.01"
          className="border rounded w-full p-2"
          placeholder="Suggested price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button
          disabled={saving}
          className="bg-blue-600 text-white rounded w-full p-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Create product'}
        </button>
        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  )
}