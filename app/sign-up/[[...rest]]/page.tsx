import { SignUp } from '@clerk/nextjs'
import { Container } from "@/components/container"

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Join Polario</h1>
            <p className="text-muted-foreground">Create your account to start generating professional brochures</p>
          </div>

          <div className="flex justify-center">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-primary hover:bg-primary/90 text-sm normal-case",
                  card: "shadow-lg"
                }
              }}
              routing="path"
              path="/sign-up"
              redirectUrl="/dashboard"
              signInUrl="/auth"
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
            />
          </div>
        </div>
      </Container>
    </div>
  )
}
