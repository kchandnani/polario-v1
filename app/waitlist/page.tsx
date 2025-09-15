"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/container"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

export default function WaitlistPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // TODO(Cursor): Replace with real API call to save email
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Container>
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">You're on the list!</h2>
              <p className="text-muted-foreground mb-6">
                Thanks for joining our waitlist. We'll notify you as soon as Polario is ready.
              </p>
              <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                Join Another Email
              </Button>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <Badge variant="secondary" className="text-sm font-medium">
              Coming Soon
            </Badge>

            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-balance">Join the Polario Waitlist</h1>

            <p className="text-xl text-muted-foreground text-pretty">
              Join early and turn raw inputs into polished brochures in minutes.
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Get Early Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !email}>
                  {isLoading ? "Joining..." : "Join Waitlist"}
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground text-center">What you'll get:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Early access to Polario beta
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Free brochure generation credits
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Priority customer support
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">No spam, ever. Unsubscribe at any time.</p>
          </div>
        </div>
      </Container>
    </div>
  )
}
