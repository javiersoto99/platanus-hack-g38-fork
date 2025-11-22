"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Pill,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  Edit,
  Power,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react"
import { Reminder, ReminderExecution } from "./types"

interface ReminderCardProps {
  reminder: Reminder
  onCardClick: (reminder: Reminder) => void
  onToggleActive: (reminder: Reminder) => void
}

export function ReminderCard({ reminder, onCardClick, onToggleActive }: ReminderCardProps) {
  const getRecentExecutions = (executions: ReminderExecution[]) => {
    return executions
      .filter((e) => e.status !== "pending")
      .slice(-5)
      .reverse()
  }

  const recentExecutions = getRecentExecutions(reminder.executions)
  const fillPercentage = reminder.medicine
    ? (reminder.medicine.tablets_left! / reminder.medicine.total_tablets!) * 100
    : 0

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on the toggle button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onCardClick(reminder)
  }

  return (
    <Card 
      className="p-6 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-32 bg-gradient-to-b from-cream/30 to-cream/50 rounded-2xl border-3 border-primary flex items-end justify-center overflow-hidden shadow-sm">
            {reminder.medicine && (
              <>
                <div
                  className="w-full bg-gradient-to-b from-primary to-primary/80 transition-all duration-700"
                  style={{ height: `${fillPercentage}%` }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Pill
                    className={`w-10 h-10 ${fillPercentage < 30 ? "text-primary/40" : "text-white/60"}`}
                  />
                  <span
                    className={`font-bold text-lg mt-1 ${fillPercentage < 30 ? "text-primary" : "text-white"}`}
                  >
                    {reminder.medicine.tablets_left}
                  </span>
                </div>
              </>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            de {reminder.medicine?.total_tablets}
          </span>
        </div>

        {/* Medicine Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-foreground">{reminder.medicine?.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{reminder.medicine?.dosage}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                reminder.is_active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {reminder.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{reminder.periodicity}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Pill className="w-4 h-4" />
              <span>{reminder.medicine?.tablets_per_dose}x dosis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(reminder.start_date).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {recentExecutions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Últimas 5 ejecuciones
              </p>
              <div className="flex items-center gap-1">
                {recentExecutions.map((execution, idx) => (
                  <div key={execution.id} className="flex items-center">
                    <div className="relative group">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                          execution.status === "success"
                            ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                            : "bg-red-100 border-red-500 dark:bg-red-900/30"
                        }`}
                      >
                        {execution.method === "whatsapp" ? (
                          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                        {execution.status === "success" ? (
                          <CheckCircle className="w-3 h-3 text-green-600 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-600 absolute -top-0.5 -right-0.5 bg-white rounded-full" />
                        )}
                      </div>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-medium">
                          {new Date(execution.executed_at).toLocaleString("es-ES")}
                        </div>
                        <div className="text-gray-300 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {execution.duration_minutes} min
                          {execution.retries > 0 && (
                            <>
                              <RotateCcw className="w-3 h-3 ml-2" />
                              {execution.retries}
                            </>
                          )}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>

                    {idx < recentExecutions.length - 1 && (
                      <div className="w-4 h-0.5 bg-border mx-0.5"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant={reminder.is_active ? "outline" : "default"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive(reminder)
            }}
          >
            <Power className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
