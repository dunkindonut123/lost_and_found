import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, ImageIcon, ArrowUpRight } from 'lucide-react'
import { ItemWithDetails } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface ItemCardProps {
  item: ItemWithDetails
}

export function ItemCard({ item }: ItemCardProps) {
  const primaryPhoto = item.item_photos?.[0]?.photo_url
  
  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
    approved: { bg: 'bg-primary/15', text: 'text-primary', dot: 'bg-primary' },
    completed: { bg: 'bg-muted/50', text: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  }

  const status = statusConfig[item.status] || statusConfig.active

  return (
    <Link href={`/dashboard/items/${item.id}`} className="group">
      <Card className="overflow-hidden border-border/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 h-full bg-secondary/40">
        <div className="aspect-[4/3] relative bg-gradient-to-br from-secondary to-secondary/70 overflow-hidden">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-background/80 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <span className="text-xs text-muted-foreground/60">No image</span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className={`${status.bg} ${status.text} border-0 backdrop-blur-md shadow-sm`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} />
              {item.status}
            </Badge>
          </div>

          {/* View indicator */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur flex items-center justify-center shadow-lg shadow-primary/40">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-3">
            <Badge variant="outline" className="text-[10px] font-medium mb-2 rounded-full px-2.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              {item.categories?.name || 'Uncategorized'}
            </Badge>
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-base">
              {item.name}
            </h3>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary/60" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary/60" />
              <span>
                {formatDistanceToNow(new Date(item.date_found), { addSuffix: true })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
