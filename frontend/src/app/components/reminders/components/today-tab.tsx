"use client"

import { useState, useEffect } from "react"
import { TimelineItem } from "./timeline-item"
import { ReminderInstance } from "./types"
import { VideoAnimation } from "./video-animation"
import AvatarDashboard from "./avatar-dashboard"
import { api } from "@/lib/api"

interface TodayTabProps {
  reminderInstances: ReminderInstance[]
  onRefresh?: () => Promise<void>
}

export function TodayTab({ reminderInstances, onRefresh }: TodayTabProps) {
  const [instances, setInstances] = useState<ReminderInstance[]>(reminderInstances)
  
  // Sync local state with props when reminderInstances changes
  useEffect(() => {
    setInstances(reminderInstances)
  }, [reminderInstances])
  
  const [markingAll, setMarkingAll] = useState(false)
  const [markingId, setMarkingId] = useState<number | null>(null)
  const anyPending = instances.some((r) => r.status !== "success")
  const allDone = instances.length > 0 && instances.every((r) => r.status === "success")

  const handleMarkAsTaken = async (instanceId: number) => {
    setMarkingId(instanceId)
    try {
      const now = new Date()
      const chileTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)) // Subtract 3 hours
      const takenAt = chileTime.toISOString()
      await api.patchReminderInstance(instanceId, {
        status: "success",
        taken_at: takenAt,
      })
      
      // Update local state
      setInstances((prev) =>
        prev.map((r) =>
          r.id === instanceId
            ? {
                ...r,
                status: "success",
                taken_at: takenAt,
              }
            : r
        )
      )
      
      // Refresh data from backend to ensure consistency
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error("Error marking reminder as taken:", error)
      alert("Error al marcar el recordatorio como tomado")
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllDone = async () => {
    setMarkingAll(true)
    try {
      const pendingInstances = instances.filter((r) => r.status !== "success")
      const takenAt = new Date().toISOString()
      
      // Update all pending instances in parallel
      await Promise.all(
        pendingInstances.map((instance) =>
          api.patchReminderInstance(instance.id, {
            status: "success",
            taken_at: takenAt,
          })
        )
      )
      
      // Update local state
      setInstances((prev) =>
        prev.map((r) => ({
          ...r,
          status: "success",
          taken_at: r.taken_at || takenAt,
        }))
      )
      
      // Refresh data from backend to ensure consistency
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error("Error marking all reminders as taken:", error)
      alert("Error al marcar todos los recordatorios como tomados")
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Recordatorios de hoy - {" "}
        {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
      </h3>
      <div className="max-w-5xl mx-auto">
        {instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-lg">No hay recordatorios para hoy</p>
            <p className="text-muted-foreground text-sm mt-2">Los recordatorios programados para hoy aparecerán aquí</p>
          </div>
        ) : (anyPending || allDone) ? (
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
              <div className="space-y-6">
                <div className="md:block">
                  <AvatarDashboard
                    reminders={instances}
                    onMarkAllDone={handleMarkAllDone}
                    loading={markingAll}
                  />
                </div>
                
                <div className="relative space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

                  {instances.map((instance) => (
                    <TimelineItem
                      key={instance.id}
                      instance={instance}
                      onRectify={handleMarkAsTaken}
                      isMarking={markingId === instance.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

            {instances.map((instance) => (
              <TimelineItem
                key={instance.id}
                instance={instance}
                onRectify={handleMarkAsTaken}
                isMarking={markingId === instance.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
