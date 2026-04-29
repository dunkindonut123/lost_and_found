'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Hand, CheckCircle } from 'lucide-react'

interface ClaimFormProps {
  itemId: string
}

export function ClaimForm({ itemId }: ClaimFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: claimError } = await supabase
        .from('claims')
        .insert({
          item_id: itemId,
          claimant_id: user.id,
          description: formData.get('description') as string,
          status: 'pending',
        })

      if (claimError) throw claimError

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/my-claims')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardContent className="py-6 text-center">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-success" />
          </div>
          <p className="font-medium text-success">Claim submitted successfully!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Redirecting to your claims...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 text-base" size="lg">
        <Hand className="w-5 h-5 mr-2" />
        Claim This Item
      </Button>
    )
  }

  return (
    <Card className="border-border/40 bg-secondary/40">
      <CardHeader>
        <CardTitle className="text-lg">Submit a Claim</CardTitle>
        <CardDescription>
          Describe why you believe this item belongs to you. Include identifying details that only the owner would know.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="description">
                Proof of Ownership
              </FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe specific details about the item that prove it's yours. For example: unique scratches, stickers, contents, serial numbers, when/where you lost it..."
                rows={5}
                required
                disabled={isLoading}
                className="bg-secondary/60 border-border/50 hover:border-border/70 focus:border-primary/70 transition-colors"
              />
            </Field>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
