import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, ClipboardList, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get counts
  const [
    { count: totalItems },
    { count: activeItems },
    { count: pendingClaims },
    { count: approvedClaims },
  ] = await Promise.all([
    supabase.from('items').select('*', { count: 'exact', head: true }),
    supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
  ])

  // Get recent pending claims
  const { data: recentClaims } = await supabase
    .from('claims')
    .select(`
      *,
      items (name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentClaimantIds = recentClaims?.map((claim) => claim.claimant_id) || []
  const { data: recentProfiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', recentClaimantIds)

  const recentProfileMap = new Map(recentProfiles?.map((profile) => [profile.id, profile]) || [])

  const stats = [
    { label: 'Total Items', value: totalItems || 0, icon: Package, color: 'text-primary' },
    { label: 'Active', value: activeItems || 0, icon: CheckCircle, color: 'text-success' },
    { label: 'Pending Claims', value: pendingClaims || 0, icon: Clock, color: 'text-warning' },
    { label: 'Approved Claims', value: approvedClaims || 0, icon: ClipboardList, color: 'text-muted-foreground' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage lost and found items and review claims
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Claims</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/claims">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!recentClaims || recentClaims.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No pending claims to review
              </p>
            ) : (
              <div className="space-y-3">
                {recentClaims.map((claim) => (
                  <Link
                    key={claim.id}
                    href={`/admin/claims/${claim.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {claim.items?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {recentProfileMap.get(claim.claimant_id)?.username || 'Unknown'} &middot;{' '}
                        {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      Pending
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/items">
                <Package className="w-4 h-4 mr-2" />
                Manage All Items
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/claims">
                <ClipboardList className="w-4 h-4 mr-2" />
                Review Claims
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
