import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: adminData } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminData) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        isAdmin={true}
      />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
