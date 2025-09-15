import { SignIn } from '@clerk/nextjs'
import { Container } from "@/components/container"

export default function AuthPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome to Polario</h1>
            <p className="text-muted-foreground">Sign in to access your dashboard and create professional brochures</p>
          </div>

          <div className="flex justify-center">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-primary hover:bg-primary/90 text-sm normal-case",
                  card: "shadow-lg"
                }
              }}
              routing="path"
              path="/auth"
              redirectUrl="/dashboard"
              signUpUrl="/sign-up"
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
            />
          </div>
        </div>
      </Container>
    </div>
  )
}
