import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import SaleScreen from './components/SaleScreen'
import ProductForm from './components/ProductForm'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'sale' | 'products'>('sale')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return null
  if (!session) return <Login />

  const tab = (v: 'sale' | 'products') =>
    `px-3 py-1 rounded ${view === v ? 'bg-blue-600 text-white' : 'text-gray-600'}`

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-3 flex justify-between items-center">
        <nav className="flex gap-2">
          <button className={tab('sale')} onClick={() => setView('sale')}>
            Sale
          </button>
          <button className={tab('products')} onClick={() => setView('products')}>
            Products
          </button>
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-gray-600">
          Sign out ({session.user.email})
        </button>
      </header>
      {view === 'sale' ? <SaleScreen /> : <ProductForm />}
    </div>
  )
}