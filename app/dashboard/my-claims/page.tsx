import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { ClipboardList, ArrowRight, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'

export default async function MyClaimsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: claims, error } = await supabase
    .from('claims')
    .select(`
      *,
      items (
        id,
        name,
        location,
        item_photos (photo_url)
      )
    `)
    .eq('claimant_id', user?.id)
    .order('created_at', { ascending: false })

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  const statusDescriptions: Record<string, string> = {
    pending: 'Waiting for admin review',
    approved: 'Claim approved - collect your item',
    rejected: 'Claim was not approved',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Claims</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your submitted claims
        </p>
      </div>

      {!claims || claims.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon"><ClipboardList /></EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No claims yet</EmptyTitle>
            <EmptyDescription>When you claim an item, it will appear here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/dashboard">Browse Items</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const photo = claim.items?.item_photos?.[0]

            return (
              <Card key={claim.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                      {photo ? (
                        <Image
                          src={photo.photo_url}
                          alt={claim.items?.name || 'Item'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {claim.items?.name || 'Unknown Item'}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[claim.status]} capitalize flex-shrink-0`}
                        >
                          {claim.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {statusDescriptions[claim.status]}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Submitted {format(new Date(claim.created_at), 'MMM d, yyyy')}
                      </p>

                      {claim.rejection_reason && (
                        <div className="mt-3 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Reason: </span>
                          {claim.rejection_reason}
                        </div>
                      )}
                    </div>

                    <Link href={`/dashboard/items/${claim.items?.id}`} className="flex-shrink-0 self-center">
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
