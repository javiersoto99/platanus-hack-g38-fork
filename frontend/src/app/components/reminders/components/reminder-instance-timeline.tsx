"use client"

import { MessageCircle, Phone } from "lucide-react"
import { ReminderInstance } from "./types"

interface ReminderInstanceTimelineProps {
  instances: ReminderInstance[]
  maxItems?: number
}

export function ReminderInstanceTimeline({ 
  instances, 
  maxItems = 5,
}: ReminderInstanceTimelineProps) {
  const displayInstances = instances.slice(0, maxItems)

  if (displayInstances.length === 0) {
    return null
  }

  const statusColors = {
    success: "bg-green-500 border-green-600",
    failed: "bg-red-500 border-red-600",
    failure: "bg-red-500 border-red-600",
    rejected: "bg-red-500 border-red-600",
    waiting: "bg-yellow-500 border-yellow-600",
    pending: "bg-gray-400 border-gray-500",
  }

  return (
    <div className="relative">
      {/* Horizontal timeline line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-border via-border to-border" />
      
      <div className="relative flex items-start gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {displayInstances.map((instance) => {
          const statusColor = statusColors[instance.status as keyof typeof statusColors] || "bg-gray-400 border-gray-500"
          const statusBg = {
            success: "bg-green-50 dark:bg-green-950/20",
            failed: "bg-red-50 dark:bg-red-950/20",
            failure: "bg-red-50 dark:bg-red-950/20",
            rejected: "bg-red-50 dark:bg-red-950/20",
            waiting: "bg-yellow-50 dark:bg-yellow-950/20",
            pending: "bg-gray-50 dark:bg-gray-950/20",
          }
          const bgColor = statusBg[instance.status as keyof typeof statusBg] || "bg-gray-50 dark:bg-gray-950/20"

          return (
            <div
              key={instance.id}
              className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[70px]"
            >
              {/* Status dot with icon */}
              <div className="relative z-10">
                <div className={`w-5 h-5 rounded-full border-2 border-background ${statusColor} flex items-center justify-center shadow-sm`}>
                  {instance.method === "whatsapp" || !instance.method ? (
                    <MessageCircle className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <Phone className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
              </div>
              
              {/* Time and status */}
              <div className={`text-center px-2 py-1 rounded-md ${bgColor} min-w-full`}>
                <div className="text-xs font-semibold text-foreground">
                  {new Date(instance.scheduled_datetime).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(instance.scheduled_datetime).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className={`text-[10px] font-medium mt-0.5 ${
                  instance.status === "success"
                    ? "text-green-700 dark:text-green-400"
                    : instance.status === "failed" || instance.status === "rejected" || instance.status === "failure"
                      ? "text-red-700 dark:text-red-400"
                      : instance.status === "waiting"
                        ? "text-yellow-700 dark:text-yellow-400"
                        : "text-gray-700 dark:text-gray-400"
                }`}>
                  {instance.status === "success"
                    ? "Tomado"
                    : instance.status === "failed"
                      ? "Fallido"
                      : instance.status === "failure"
                        ? "Error"
                        : instance.status === "rejected"
                          ? "Rechazado"
                          : instance.status === "waiting"
                            ? "Esperando"
                            : "Pendiente"}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

