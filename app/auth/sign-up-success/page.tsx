import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Mail, CheckCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Gradient backgrounds */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-30" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-success/20 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 opacity-30" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Lost & Found</h1>
          </div>
        </div>

        <Card className="border-border/40 shadow-2xl bg-secondary/40 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a confirmation link to activate your account
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex items-start justify-center gap-3 p-4 bg-secondary/60 rounded-lg border border-border/50">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground text-left">
                Please check your inbox (and spam folder) and click the confirmation link to activate your account and start using Lost & Found.
              </span>
            </div>

            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
              <Link href="/auth/login">
                Back to login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
