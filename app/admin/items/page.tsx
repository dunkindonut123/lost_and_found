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
import { Package, ArrowRight, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'

interface ItemsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminItemsPage({ searchParams }: ItemsPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  let query = supabase
    .from('items')
    .select(`
      *,
      categories (name),
      item_photos (photo_url),
      profiles (username)
    `)
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data: items } = await query

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-muted text-muted-foreground border-muted',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Items</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all reported items
          </p>
        </div>

        <form>
          <Select name="status" defaultValue={params.status || 'all'}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </form>
      </div>

      {!items || items.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon"><Package /></EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No items found</EmptyTitle>
            <EmptyDescription>Items will appear here when they are reported.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const photo = item.item_photos?.[0]

            return (
              <Card key={item.id}>
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
                      {photo ? (
                        <Image
                          src={photo.photo_url}
                          alt={item.name}
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
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.categories?.name} &middot; Reported by {item.profiles?.username}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${statusColors[item.status]} capitalize flex-shrink-0`}
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.location}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Found {format(new Date(item.date_found), 'MMM d, yyyy')}
                      </p>
                    </div>

                    <Link href={`/admin/items/${item.id}`} className="flex-shrink-0 self-center">
                      <Button variant="outline" size="sm">
                        Manage <ArrowRight className="w-4 h-4 ml-1" />
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
