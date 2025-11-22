"use client"

import { useState } from "react"
import { TimelineItem } from "./timeline-item"
import { ReminderInstance } from "./types"
import { VideoAnimation } from "./video-animation"
import AvatarDashboard from "./avatar-dashboard"

interface TodayTabProps {
  reminderInstances: ReminderInstance[]
}

export function TodayTab({ reminderInstances }: TodayTabProps) {
  const [instances, setInstances] = useState<ReminderInstance[]>(() => reminderInstances)
  const anyPending = instances.some((r) => r.status !== "success")
  const allDone = instances.length > 0 && instances.every((r) => r.status === "success")

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto">
        {(anyPending || allDone) && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="flex justify-start">
                <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden shadow-lg avatar-shadow-reduced">
                  {anyPending ? (
                    <VideoAnimation src="/videos/waiting.mp4" label="esperando medicamento" />
                  ) : (
                    <VideoAnimation src="/videos/happy.mp4" label="feliz después de tomar" />
                  )}
                </div>
              </div>
              <div className="hidden md:block h-64 sm:h-80 md:h-96">
                <AvatarDashboard
                  reminders={instances}
                  onMarkAllDone={() => {
                    setInstances((prev) =>
                      prev.map((r) => ({
                        ...r,
                        status: "success",
                        taken_at: new Date().toISOString(),
                      }))
                    )
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-foreground mb-6">
          Recordatorios de hoy - {" "}
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </h3>

        <div className="relative space-y-6">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

          {instances.map((instance) => (
            <TimelineItem
              key={instance.id}
              instance={instance}
              onRectify={(id) => {
                setInstances((prev) =>
                  prev.map((r) =>
                    r.id === id
                      ? {
                          ...r,
                          status: "success",
                          taken_at: new Date().toISOString(),
                        }
                      : r
                  )
                )
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
