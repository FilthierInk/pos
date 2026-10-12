import { useState } from 'react'
import { supabase } from '../lib/supabase'

const RFC_REGEX = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/

export default function ClientForm() {
  const [name, setName] = useState('')
  const [rfc, setRfc] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')

    const cleanRfc = rfc.trim().toUpperCase()
    if (!RFC_REGEX.test(cleanRfc)) {
      setMessage('Error: invalid RFC format (12 or 13 characters)')
      return
    }

    setSaving(true)
    const { error } = await supabase.from('client').insert({
      name: name.trim(),
      rfc: cleanRfc,
    })
    setSaving(false)

    if (error) {
      setMessage(
        error.code === '23505'
          ? 'Error: that RFC already exists'
          : `Error: ${error.message}`
      )
    } else {
      setMessage('Client created')
      setName('')
      setRfc('')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="font-bold mb-3">New client</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-3">
        <input
          className="border rounded w-full p-2"
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border rounded w-full p-2 uppercase"
          placeholder="RFC"
          maxLength={13}
          value={rfc}
          onChange={(e) => setRfc(e.target.value)}
          required
        />
        <button
          disabled={saving}
          className="bg-blue-600 text-white rounded w-full p-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Create client'}
        </button>
        {message && <p className="text-sm">{message}</p>}
      </form>
    </div>
  )
}