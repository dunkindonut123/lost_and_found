import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { ClipboardList, ArrowRight, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'

interface ClaimsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminClaimsPage({ searchParams }: ClaimsPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  let query = supabase
    .from('claims')
    .select(`
      *,
      items (
        id,
        name,
        item_photos (photo_url)
      )
    `)
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data: claims, error } = await query

  // Fetch claimant profiles separately
  const claimantIds = claims?.map(c => c.claimant_id) || []
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, student_id')
    .in('id', claimantIds)

  // Create a map of claimant_id to profile for easy lookup
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Claims</h1>
          <p className="text-muted-foreground mt-1">
            Review and process item claims
          </p>
        </div>

        <form>
          <Select name="status" defaultValue={params.status || 'all'}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Claims</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </form>
      </div>

      {!claims || claims.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon"><ClipboardList /></EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No claims found</EmptyTitle>
            <EmptyDescription>Claims will appear here when students submit them.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const photo = claim.items?.item_photos?.[0]

            return (
              <Card key={claim.id}>
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                      {photo ? (
                        <Image
                          src={photo.photo_url}
                          alt={claim.items?.name || 'Item'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {claim.items?.name || 'Unknown Item'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Claimed by {profileMap.get(claim.claimant_id)?.username || 'Unknown'} ({profileMap.get(claim.claimant_id)?.student_id || 'N/A'})
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[claim.status]} capitalize flex-shrink-0`}
                        >
                          {claim.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {claim.description}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {format(new Date(claim.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>

                    <Link href={`/admin/claims/${claim.id}`} className="flex-shrink-0 self-center">
                      <Button variant="outline" size="sm">
                        Review <ArrowRight className="w-4 h-4 ml-1" />
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
