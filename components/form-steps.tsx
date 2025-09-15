import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: number
  title: string
  description: string
}

interface FormStepsProps {
  steps: Step[]
  currentStep: number
}

export function FormSteps({ steps, currentStep }: FormStepsProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn(stepIdx !== steps.length - 1 ? "flex-1" : "", "relative")}>
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                    step.id < currentStep
                      ? "bg-primary border-primary text-primary-foreground"
                      : step.id === currentStep
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground",
                  )}
                >
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.id <= currentStep ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {stepIdx !== steps.length - 1 && <div className="ml-4 flex-1 h-0.5 bg-muted" />}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
