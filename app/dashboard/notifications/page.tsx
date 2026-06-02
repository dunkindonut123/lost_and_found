import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Bell, CheckCircle, XCircle, Info, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { MarkAsReadButton } from '@/components/mark-as-read-button'

export default async function NotificationsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const getIcon = (title?: string | null) => {
    const t = (title || '').toLowerCase()
    if (t.includes('approved')) {
      return <CheckCircle className="w-5 h-5 text-success" />
    } else if (t.includes('rejected')) {
      return <XCircle className="w-5 h-5 text-destructive" />
    }
    return <Info className="w-5 h-5 text-primary" />
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && <MarkAsReadButton />}
      </div>

      {!notifications || notifications.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon"><Bell /></EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>{"You'll be notified when there are updates on your claims."}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={notification.read ? 'opacity-75' : 'border-primary/20'}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{notification.title ?? (notification.type || 'Notification')}</p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {notification.claim_id && (
                    <Link href={`/dashboard/my-claims`} className="flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        View <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
