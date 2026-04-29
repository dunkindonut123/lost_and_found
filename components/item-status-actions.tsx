'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, RotateCcw, Trash2 } from 'lucide-react'
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

interface ItemStatusActionsProps {
  itemId: string
  currentStatus: string
}

export function ItemStatusActions({ itemId, currentStatus }: ItemStatusActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function updateStatus(newStatus: string) {
    setIsLoading(true)
    const supabase = createClient()

    try {
      await supabase
        .from('items')
        .update({ status: newStatus })
        .eq('id', itemId)

      router.refresh()
    } catch (error) {
      console.error('Error updating item status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteItem() {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Delete related records first
      await supabase.from('item_photos').delete().eq('item_id', itemId)
      await supabase.from('claims').delete().eq('item_id', itemId)
      await supabase.from('notifications').delete().eq('item_id', itemId)
      await supabase.from('items').delete().eq('id', itemId)

      router.push('/admin/items')
    } catch (error) {
      console.error('Error deleting item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentStatus === 'approved' && (
          <Button
            className="w-full bg-success text-success-foreground hover:bg-success/90"
            onClick={() => updateStatus('completed')}
            disabled={isLoading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Completed (Returned)
          </Button>
        )}

        {currentStatus === 'completed' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => updateStatus('active')}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reopen Item
          </Button>
        )}

        {currentStatus !== 'active' && currentStatus !== 'completed' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => updateStatus('active')}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Active
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Item
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
                All associated claims and photos will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteItem}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
