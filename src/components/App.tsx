import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './components/Login'
import SaleScreen from './components/SaleScreen'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-3 flex justify-between">
        <span className="font-bold">POS</span>
        <button onClick={() => supabase.auth.signOut()} className="text-sm text-gray-600">
          Sign out ({session.user.email})
        </button>
      </header>
      <SaleScreen />
    </div>
  )
}Add-Content .gitignore ".env" -Encoding utf8