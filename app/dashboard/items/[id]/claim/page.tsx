'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

interface ClaimPageProps {
  params: Promise<{ id: string }>
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [itemId, setItemId] = useState<string | null>(null)

  // Resolve params and extract id
  useEffect(() => {
    Promise.resolve(params).then((resolvedParams) => {
      setItemId(resolvedParams.id)
    })
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be signed in to submit a claim')
        return
      }

      if (!itemId) {
        setError('Item ID not found')
        return
      }

      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .insert({
          item_id: itemId,
          claimant_id: user.id,
          description,
          status: 'pending',
        })
        .select()
        .single()

      if (claimError) {
        setError(claimError.message || 'Failed to submit claim')
        return
      }

      setSuccess(true)
      setDescription('')

      // Redirect after 2 seconds
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
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/items/${itemId}`}>
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Item
          </Button>
        </Link>

        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            <div className="mb-4 w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Claim Submitted!</h2>
            <p className="text-muted-foreground max-w-md">
              Your claim has been submitted for admin review. You&apos;ll be notified when a decision is made.
            </p>
            <Button asChild className="mt-6 bg-primary hover:bg-primary/90">
              <Link href="/dashboard/my-claims">
                View My Claims
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/items/${itemId}`}>
        <Button variant="ghost" className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Item
        </Button>
      </Link>

      <Card className="border-border/40 bg-secondary/40">
        <CardHeader>
          <CardTitle className="text-2xl">Submit a Claim</CardTitle>
          <CardDescription>
            Describe why you believe this item belongs to you. Include specific details that only the owner would know.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="description">
                  Proof of Ownership
                </FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Example: This is my laptop with a cracked screen and a sticker of my university logo on the back. The serial number is... I lost it on March 15th near the library."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                  disabled={isLoading}
                  className="bg-secondary/60 border-border/50 hover:border-border/70 focus:border-primary/70 transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Be as specific as possible. The admin team will review your claim and contact you if approved.
                </p>
              </Field>
            </FieldGroup>

            {error && (
              <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Error submitting claim</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
