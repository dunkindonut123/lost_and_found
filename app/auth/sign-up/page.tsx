'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Search, MapPin } from 'lucide-react'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-30" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 opacity-30" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Lost & Found</h1>
          </div>
          <p className="text-muted-foreground text-center text-sm">
            Find what you&apos;ve lost, return what you&apos;ve found
          </p>
        </div>

        <Card className="border-border/40 shadow-2xl bg-secondary/40 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Join our campus community to find lost items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                    className="bg-secondary/60 border-border/50 hover:border-border/70 focus:border-primary/70 transition-colors"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="studentId">Student ID</FieldLabel>
                  <Input
                    id="studentId"
                    name="studentId"
                    type="text"
                    placeholder="STU123456"
                    required
                    disabled={isLoading}
                    className="bg-secondary/60 border-border/50 hover:border-border/70 focus:border-primary/70 transition-colors"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@university.edu"
                    required
                    disabled={isLoading}
                    className="bg-secondary/60 border-border/50 hover:border-border/70 focus:border-primary/70 transition-colors"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="bg-secondary/60 border-border/50 hover:border-border/70 focus:border-primary/70 transition-colors"
                  />
                </Field>

                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </FieldGroup>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-primary hover:text-primary/80 underline font-medium transition-colors">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
          <MapPin className="w-4 h-4" />
          <span>Campus Lost & Found System</span>
        </div>
      </div>
    </div>
  )
}
