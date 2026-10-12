import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { LogOut, Package, ShoppingCart, Users } from 'lucide-react'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import SaleScreen from './components/SaleScreen'
import ClientsScreen from './components/ClientsScreen'
import ProductsScreen from './components/ProductsScreen'

type View = 'sale' | 'products' | 'clients'

const TABS = [
  { id: 'sale', label: 'Sale', Icon: ShoppingCart },
  { id: 'products', label: 'Products', Icon: Package },
  { id: 'clients', label: 'Clients', Icon: Users },
] as const

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('sale')

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

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold tracking-tight">POS</span>
            <nav className="hidden gap-1 md:flex">
              {TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    view === id
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="btn-ghost">
            <span className="hidden sm:inline">{session.user.email}</span>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        {view === 'sale' && <SaleScreen />}
        {view === 'products' && <ProductsScreen />}
        {view === 'clients' && <ClientsScreen  />}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-3 border-t border-neutral-200 bg-white md:hidden">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
              view === id ? 'text-neutral-900' : 'text-neutral-400'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}