"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReminderInstance } from "./types"

interface AvatarDashboardProps {
  reminders: ReminderInstance[]
  onMarkAllDone?: () => void
}

function formatTime(dt: string) {
  const d = new Date(dt)
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

export function AvatarDashboard({ reminders, onMarkAllDone }: AvatarDashboardProps) {
  const total = reminders.length
  const done = reminders.filter((r) => r.status === "success").length
  const pending = total - done

  // upcoming: sort ascending and take next 4
  const upcoming = reminders
    .slice()
    .sort((a, b) => new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime())
    .slice(0, 8)

  const nextPending = reminders
    .slice()
    .filter((r) => r.status !== "success")
    .sort((a, b) => new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime())[0]

  return (
    <Card className="w-full h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold">Resumen</h4>
          <p className="text-xs text-muted-foreground">Hoy</p>
        </div>
        <div>
          <Button size="sm" onClick={onMarkAllDone} className="bg-primary hover:bg-primary/90">
            Marcar todos como tomados
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="font-bold text-lg">{total}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Completados</div>
          <div className="font-bold text-lg text-green-600">{done}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Pendientes</div>
          <div className="font-bold text-lg text-pink-600">{pending}</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs text-muted-foreground mb-1">Próximo</div>
        {nextPending ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{nextPending.medicine_name}</div>
              <div className="text-xs text-muted-foreground">{formatTime(nextPending.scheduled_datetime)}</div>
            </div>
            <div className="text-sm text-muted-foreground">{nextPending.dosage}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No hay próximos pendientes</div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="text-xs text-muted-foreground mb-2">Siguientes</div>
        <div className="space-y-2">
          {upcoming.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
              <div>
                <div className="text-sm font-medium">{r.medicine_name}</div>
                <div className="text-xs text-muted-foreground">{formatTime(r.scheduled_datetime)}</div>
              </div>
              <div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "success" ? "bg-green-100 text-green-700" : "bg-pink-100 text-pink-700"}`}>
                  {r.status === "success" ? "Tomado" : "Pendiente"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default AvatarDashboard