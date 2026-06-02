import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MapPin, Calendar, User, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ItemStatusActions } from '@/components/item-status-actions'

interface ItemDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error } = await supabase
    .from('items')
    .select(`
      *,
      categories (name),
      item_photos (id, photo_url)
    `)
    .eq('id', id)
    .single()

  if (error || !item) {
    notFound()
  }

  const { data: reporterProfile } = await supabase
    .from('profiles')
    .select('username, student_id')
    .eq('id', item.reporter_id)
    .maybeSingle()

  // Get claims for this item
  const { data: claims } = await supabase
    .from('claims')
    .select(`
      *,
      item_id
    `)
    .eq('item_id', id)
    .order('created_at', { ascending: false })

  const claimantIds = claims?.map((claim) => claim.claimant_id) || []
  const { data: claimProfiles } = await supabase
    .from('profiles')
    .select('id, username, student_id')
    .in('id', claimantIds)

  const claimProfileMap = new Map(claimProfiles?.map((profile) => [profile.id, profile]) || [])

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-muted text-muted-foreground border-muted',
  }

  const claimStatusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  const photos = item.item_photos || []
  const primaryPhoto = photos[0]

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/items">
        <Button variant="ghost" className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Button>
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Item Details</h1>
        <Badge 
          variant="outline" 
          className={`${statusColors[item.status]} capitalize text-sm px-3 py-1`}
        >
          {item.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Item Photos */}
        <div className="space-y-4">
          <div className="aspect-square relative bg-muted rounded-xl overflow-hidden">
            {primaryPhoto ? (
                <Image
                src={primaryPhoto.photo_url}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground/50" />
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo: { id: string; photo_url: string }) => (
                <div
                  key={photo.id}
                  className="w-20 h-20 relative flex-shrink-0 rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={photo.photo_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge variant="secondary">{item.categories?.name || 'Uncategorized'}</Badge>
              </div>
              <CardTitle className="text-xl">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{item.description}</p>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Found {format(new Date(item.date_found), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Reported by {reporterProfile?.username || 'Unknown'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <ItemStatusActions itemId={item.id} currentStatus={item.status} />
        </div>
      </div>

      {/* Claims Section */}
      {claims && claims.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Claims ({claims.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/admin/claims/${claim.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {claimProfileMap.get(claim.claimant_id)?.username || 'Unknown'} ({claimProfileMap.get(claim.claimant_id)?.student_id || 'N/A'})
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {claim.description}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${claimStatusColors[claim.status]} capitalize`}
                  >
                    {claim.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
