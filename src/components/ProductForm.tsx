import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProductForm({ onCreated }: { onCreated: () => void }) {
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
      onCreated()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">SKU</label>
          <input className="input" value={sku} onChange={(e) => setSku(e.target.value)} required />
        </div>
        <div>
          <label className="label">SAT code</label>
          <input className="input" value={satCode} onChange={(e) => setSatCode(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
        <label className="label">Suggested price</label>
        <input
          type="number"
          min={0}
          step="0.01"
          className="input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <button disabled={saving} className="btn-primary w-full">
        {saving ? 'Saving...' : 'Create product'}
      </button>
      {message && (
        <p className={`text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>
          {message}
        </p>
      )}
    </form>
  )
}