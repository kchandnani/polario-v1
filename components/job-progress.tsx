import { CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface JobProgressProps {
  status: "queued" | "running" | "done" | "error"
  progress: number
}

const PROGRESS_STEPS = [
  { id: "queued", label: "Queued", description: "Waiting in queue" },
  { id: "processing", label: "Processing", description: "Analyzing your input" },
  { id: "generating", label: "Generating", description: "Creating your brochure" },
  { id: "finalizing", label: "Finalizing", description: "Preparing download" },
]

export function JobProgress({ status, progress }: JobProgressProps) {
  const getCurrentStep = () => {
    if (status === "error") return -1
    if (status === "done") return PROGRESS_STEPS.length
    if (status === "queued") return 0
    if (progress < 25) return 1
    if (progress < 75) return 2
    return 3
  }

  const currentStep = getCurrentStep()

  const getStepIcon = (stepIndex: number) => {
    if (status === "error") {
      return <AlertCircle className="w-4 h-4 text-destructive" />
    }

    if (stepIndex < currentStep) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (stepIndex === currentStep && status === "running") {
      return <Loader2 className="w-4 h-4 animate-spin text-primary" />
    } else {
      return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (status === "error") return "error"
    if (stepIndex < currentStep) return "completed"
    if (stepIndex === currentStep) return "current"
    return "pending"
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Progress Steps</h4>
      <div className="space-y-3">
        {PROGRESS_STEPS.map((step, index) => {
          const stepStatus = getStepStatus(index)

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2",
                  stepStatus === "completed" && "bg-green-100 border-green-600",
                  stepStatus === "current" && "bg-primary/10 border-primary",
                  stepStatus === "pending" && "bg-muted border-muted-foreground/25",
                  stepStatus === "error" && "bg-red-100 border-red-600",
                )}
              >
                {getStepIcon(index)}
              </div>

              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium text-sm",
                    stepStatus === "completed" && "text-green-700",
                    stepStatus === "current" && "text-primary",
                    stepStatus === "pending" && "text-muted-foreground",
                    stepStatus === "error" && "text-destructive",
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
