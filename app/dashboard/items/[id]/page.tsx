import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, MapPin, Calendar, User, ImageIcon, Clock, Hand } from 'lucide-react'
import { format } from 'date-fns'

interface ItemDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: item, error } = await supabase
    .from('items')
    .select(`
      *,
      categories (id, name),
      item_photos (id, photo_url)
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !item) {
    notFound()
  }

  // Fetch reporter profile separately
  const { data: reporterProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', item.reporter_id)
    .maybeSingle()

  // Check if user already has a pending claim
  const { data: existingClaim } = await supabase
    .from('claims')
    .select('id, status')
    .eq('item_id', id)
    .eq('claimant_id', user?.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle()

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-muted text-muted-foreground border-muted',
  }

  const photos = item.item_photos || []
  const primaryPhoto = photos[0]

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Gallery */}
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
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <Badge variant="secondary">{item.categories?.name || 'Uncategorized'}</Badge>
              <Badge 
                variant="outline" 
                className={`${statusColors[item.status]} capitalize`}
              >
                {item.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location Found</p>
                  <p className="text-sm text-muted-foreground">{item.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date Found</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(item.date_found), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Reported</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(item.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Reported By</p>
                  <p className="text-sm text-muted-foreground">
                    {reporterProfile?.username || 'Anonymous'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claim Section */}
          {user && !existingClaim && item.status === 'active' && (
            <Link href={`/dashboard/items/${item.id}/claim`}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 text-base" size="lg">
                <Hand className="w-5 h-5 mr-2" />
                Claim This Item
              </Button>
            </Link>
          )}

          {existingClaim && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-primary">
                  {existingClaim.status === 'pending' 
                    ? 'You have a pending claim for this item'
                    : 'Your claim has been approved'}
                </p>
                <Link href="/dashboard/my-claims">
                  <Button variant="link" className="px-0 text-primary">
                    View your claims
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {item.status !== 'active' && !existingClaim && (
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="pt-6">
                <p className="text-sm text-warning">
                  This item is no longer available for claiming.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
