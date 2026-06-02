'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'

interface RemoveItemButtonProps {
  itemId: string
  label?: string
  className?: string
}

export function RemoveItemButton({ itemId, label = 'Remove Item', className }: RemoveItemButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function removeItem() {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Delete related records first so the item can be removed cleanly.
      const deleteSteps = [
        supabase.from('item_photos').delete().eq('item_id', itemId),
        supabase.from('claims').delete().eq('item_id', itemId),
        supabase.from('notifications').delete().eq('item_id', itemId),
      ]

      const results = await Promise.all(deleteSteps)
      const stepError = results.find((result) => result.error)?.error
      if (stepError) throw stepError

      const { error: itemError } = await supabase.from('items').delete().eq('id', itemId)
      if (itemError) throw itemError

      router.refresh()
      router.push('/admin/items')
    } catch (error) {
      console.error('Error removing item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className={className}
          disabled={isLoading}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Item</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the item along with its claims, photos, and notifications. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={removeItem}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}