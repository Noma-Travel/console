/**
 * Standalone PlanChecklist Component
 * 
 * DEPENDENCIES REQUIRED:
 * - react (for useState hook)
 * - lucide-react (for icons: CheckCircle2, Clock, XCircle)
 * - tailwindcss (for styling)
 * - @/lib/utils (for cn utility function)
 * 
 * CSS VARIABLES USED (optional - will fallback to defaults):
 * - text-muted-foreground (falls back to gray)
 * - text-destructive (falls back to red)
 * - bg-card (falls back to white/transparent)
 * - text-card-foreground (falls back to black)
 * - bg-popover (falls back to white)
 * - text-popover-foreground (falls back to black)
 * - bg-muted-foreground (falls back to gray)
 */

import { CheckCircle2, Clock, XCircle } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

type StepStatus = "pending" | "completed" | "error"

interface SubStep {
  name: string
  status: StepStatus
  type?: string
}

interface PlanItem {
  title: string
  status: StepStatus
  subSteps: SubStep[]
}

interface PlanChecklistProps {
  items: PlanItem[]
}

const statusIcons = {
  pending: <Clock className="w-5 h-5 text-muted-foreground" />,
  completed: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  error: <XCircle className="w-5 h-5 text-destructive" />,
}

const subStepColors = {
  pending: "bg-muted-foreground/30",
  completed: "bg-green-600",
  error: "bg-destructive",
}

const getSubStepColor = (subStep: SubStep): string => {
  // Map specific types to colors
  if (subStep.type === 'consent_rq') {
    return "bg-blue-500"
  } else if (subStep.type === 'consent_ok') {
    return "bg-amber-500"
  } else if (subStep.type === 'tool_ok') {
    return "bg-green-600"
  } else if (subStep.type === 'decision_rq') {
    return "bg-purple-500"
  }
  
  // Fallback to status-based colors
  return subStepColors[subStep.status]
}

export function PlanChecklist({ items }: PlanChecklistProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null)

  return (
    <div className="w-full p-6 rounded-lg border bg-card">
      <div className="space-y-2">
        {items.map((item, itemIndex) => (
          <div key={itemIndex} className="flex gap-4 items-center">
            {/* Status Icon */}
            <div className="flex-shrink-0">{statusIcons[item.status]}</div>

            <div className="flex-1 flex items-center justify-between gap-6">
              {/* Title */}
              <span className="text-xs font-medium text-card-foreground">{item.title}</span>

              {/* Sub-steps Progress Bar */}
              <div className="flex gap-2 items-center">
                {item.subSteps.map((subStep, subStepIndex) => {
                  const stepId = `${itemIndex}-${subStepIndex}`

                  return (
                    <div
                      key={subStepIndex}
                      className="relative"
                      onMouseEnter={() => setHoveredStep(stepId)}
                      onMouseLeave={() => setHoveredStep(null)}
                    >
                      {/* Circle */}
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full transition-transform hover:scale-125 cursor-pointer",
                          getSubStepColor(subStep),
                        )}
                      />

                      {/* Tooltip */}
                      {hoveredStep === stepId && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border whitespace-nowrap z-10">
                          {subStep.name}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-4 border-transparent border-t-popover" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

