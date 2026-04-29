'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { CheckCircle, XCircle } from 'lucide-react'

interface ClaimActionsProps {
  claimId: string
  itemId: string
  userId: string
}

export function ClaimActions({ claimId, itemId, userId }: ClaimActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  async function handleAction(action: 'approved' | 'rejected') {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Update claim status
      const { error: claimError } = await supabase
        .from('claims')
        .update({
          status: action,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', claimId)

      if (claimError) throw claimError

      // If approved, update item status
      if (action === 'approved') {
        await supabase
          .from('items')
          .update({ status: 'claimed' })
          .eq('id', itemId)

        // Reject other pending claims for this item
        await supabase
          .from('claims')
          .update({ 
            status: 'rejected', 
            admin_notes: 'Another claim was approved for this item.' 
          })
          .eq('item_id', itemId)
          .eq('status', 'pending')
          .neq('id', claimId)
      }

      // Create notification for the claimant
      await supabase.from('notifications').insert({
        user_id: userId,
        type: action === 'approved' ? 'claim_approved' : 'claim_rejected',
        message: action === 'approved'
          ? 'Your claim has been approved! Please visit the Lost & Found office to collect your item.'
          : `Your claim has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''}`,
        item_id: itemId,
      })

      router.push('/admin/claims')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process claim'
      setError(errorMessage)
      console.error('Error processing claim:', err)
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/40 bg-secondary/40">
      <CardHeader>
        <CardTitle className="text-lg">Review Decision</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="notes">Admin Notes (optional)</FieldLabel>
            <Textarea
              id="notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes for the claimant or for internal reference..."
              rows={3}
              disabled={isLoading}
              className="bg-secondary/60 border-border/50 hover:border-border/70 focus:border-primary/70 transition-colors"
            />
          </Field>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => handleAction('rejected')}
              disabled={isLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Processing...' : 'Reject'}
            </Button>
            <Button
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground font-semibold"
              onClick={() => handleAction('approved')}
              disabled={isLoading}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Processing...' : 'Approve'}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
