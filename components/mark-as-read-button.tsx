'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export function MarkAsReadButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function markAllAsRead() {
    setIsLoading(true)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    router.refresh()
    setIsLoading(false)
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={markAllAsRead}
      disabled={isLoading}
    >
      <Check className="w-4 h-4 mr-2" />
      Mark all read
    </Button>
  )
}
