'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { Category } from '@/lib/types'

interface SearchFiltersProps {
  categories: Category[]
}

export function SearchFilters({ categories }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const updateFilters = useCallback((key: string, value: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/dashboard?${params.toString()}`)
    })
  }, [router, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('q', searchQuery || null)
  }

  const clearFilters = () => {
    setSearchQuery('')
    startTransition(() => {
      router.push('/dashboard')
    })
  }

  const hasFilters = searchParams.get('q') || searchParams.get('category') || searchParams.get('status')

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-end">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items by name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/60 border-border/50 hover:border-border/70 transition-colors"
          />
        </div>
        <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
          Search
        </Button>
      </form>

      <div className="flex gap-2 w-full sm:w-auto">
        <Select
          value={searchParams.get('category') || ''}
          onValueChange={(value) => updateFilters('category', value || null)}
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-secondary/60 border-border/50 hover:border-border/70 transition-colors">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('status') || 'active'}
          onValueChange={(value) => updateFilters('status', value === 'active' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[140px] bg-secondary/60 border-border/50 hover:border-border/70 transition-colors">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
