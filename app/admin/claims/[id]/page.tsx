import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MapPin, Calendar, User, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ClaimActions } from '@/components/claim-actions'
import { RemoveItemButton } from '@/components/remove-item-button'

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: claim, error } = await supabase
    .from('claims')
    .select(`
      *,
      items (
        *,
        categories (name),
        item_photos (id, photo_url)
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !claim) {
    notFound()
  }

  // Fetch claimant profile separately
  const { data: claimantProfile } = await supabase
    .from('profiles')
    .select('username, student_id')
    .eq('id', claim.claimant_id)
    .maybeSingle()

  const { data: reporterProfile } = await supabase
    .from('profiles')
    .select('username, student_id')
    .eq('id', claim.items?.reporter_id)
    .maybeSingle()

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  const photos = claim.items?.item_photos || []
  const primaryPhoto = photos[0]

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin/claims">
        <Button variant="ghost" className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Claims
        </Button>
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Review Claim</h1>
        <Badge 
          variant="outline" 
          className={`${statusColors[claim.status]} capitalize text-sm px-3 py-1`}
        >
          {claim.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Item Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
              {primaryPhoto ? (
                <Image
                  src={primaryPhoto.photo_url}
                  alt={claim.items?.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                </div>
              )}
            </div>

            <div>
              <Badge variant="secondary" className="mb-2">
                {claim.items?.categories?.name || 'Uncategorized'}
              </Badge>
              <h2 className="text-xl font-semibold">{claim.items?.name}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {claim.items?.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{claim.items?.location}</span>
                </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Found {format(new Date(claim.items?.date_found), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claim Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Claimant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{claimantProfile?.username || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    Student ID: {claimantProfile?.student_id || 'N/A'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Submitted {format(new Date(claim.created_at), 'MMMM d, yyyy h:mm a')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Reported by: {reporterProfile?.username || 'Unknown'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Proof of Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {claim.description}
              </p>
            </CardContent>
          </Card>

          {claim.status === 'pending' && (
            <ClaimActions claimId={claim.id} itemId={claim.items?.id} userId={claim.claimant_id} />
          )}

          {claim.status === 'approved' && claim.items?.id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Removal</CardTitle>
              </CardHeader>
              <CardContent>
                <RemoveItemButton itemId={claim.items.id} label="Remove Item" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" />
              </CardContent>
            </Card>
          )}

          {claim.rejection_reason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {claim.rejection_reason}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
