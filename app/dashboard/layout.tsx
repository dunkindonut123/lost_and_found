import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get notification count
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  // Check if user is admin
  const { data: adminData } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        notificationCount={count || 0} 
        isAdmin={!!adminData}
      />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
