"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/container"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, LogIn, UserPlus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthPage() {
  const handleSignIn = () => {
    // TODO(Cursor): Replace with real Clerk sign in
    alert("Sign in functionality will be implemented with Clerk integration")
  }

  const handleSignUp = () => {
    // TODO(Cursor): Replace with real Clerk sign up
    alert("Sign up functionality will be implemented with Clerk integration")
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-4">
            <Badge variant="secondary" className="text-sm font-medium">
              Authentication Stub
            </Badge>

            <h1 className="text-3xl font-bold">Welcome to Polario</h1>
            <p className="text-muted-foreground">Sign in to access your dashboard and create professional brochures</p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is a frontend-only stub. Authentication will be implemented with Clerk during backend integration.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleSignIn}>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In with Clerk
              </Button>

              <Button variant="outline" className="w-full bg-transparent" onClick={handleSignUp}>
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up with Clerk
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue as guest</span>
                </div>
              </div>

              <Button variant="secondary" className="w-full" asChild>
                <a href="/dashboard">Continue to Dashboard</a>
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}
