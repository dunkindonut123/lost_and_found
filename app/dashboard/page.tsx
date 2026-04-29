import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ItemCard } from '@/components/item-card'
import { SearchFilters } from '@/components/search-filters'
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Package, Sparkles } from 'lucide-react'
import { ItemWithDetails } from '@/lib/types'

interface DashboardPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    status?: string
  }>
}

async function ItemsGrid({ searchParams }: { searchParams: { q?: string; category?: string; status?: string } }) {
  const supabase = await createClient()
  
  let query = supabase
    .from('items')
    .select(`
      *,
      categories (id, name),
      item_photos (id, photo_url)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }
  
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }
  
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  } else {
    // By default, show active items
    query = query.eq('status', 'active')
  }

  const { data: items, error } = await query

  if (error) {
    console.error('Error fetching items:', error)
    return (
      <div className="py-16">
        <Empty>
          <EmptyMedia variant="icon"><Package /></EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Error loading items</EmptyTitle>
            <EmptyDescription>Please try again later.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16">
        <Empty>
          <EmptyMedia variant="icon"><Package /></EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No items found</EmptyTitle>
            <EmptyDescription>
              {searchParams.q || searchParams.category 
                ? "Try adjusting your search or filters." 
                : "No lost items have been reported yet. Check back soon!"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item as ItemWithDetails} />
      ))}
    </div>
  )
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedParams = await searchParams
  const supabase = await createClient()
  
  // Fetch categories for the filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Get stats
  const { count: totalItems } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/60 to-secondary/40 border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 opacity-50" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-semibold border border-primary/30">
              <Sparkles className="w-4 h-4" />
              <span>{totalItems || 0} items available</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-3">
            Find Your Lost Items
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Browse through found items on campus. Use filters to narrow down your search and reclaim what&apos;s yours.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilters categories={categories || []} />

      {/* Items Grid */}
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner className="w-10 h-10 text-primary" />
          <p className="text-sm text-muted-foreground">Loading items...</p>
        </div>
      }>
        <ItemsGrid searchParams={resolvedParams} />
      </Suspense>
    </div>
  )
}
