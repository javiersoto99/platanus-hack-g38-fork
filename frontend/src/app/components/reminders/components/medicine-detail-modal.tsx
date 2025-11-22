"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Pill,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Power,
  Edit,
  Eye,
  Calendar,
} from "lucide-react"
import { Reminder, ReminderExecution } from "./types"

interface MedicineDetailModalProps {
  isOpen: boolean
  onClose: () => void
  reminder: Reminder | null
  onDelete: () => void
  onToggleActive: (reminder: Reminder) => void
}

export function MedicineDetailModal({
  isOpen,
  onClose,
  reminder,
  onDelete,
  onToggleActive,
}: MedicineDetailModalProps) {
  const [isEditMode, setIsEditMode] = useState(false)

  if (!reminder) return null

  const getRecentExecutions = (executions: ReminderExecution[]) => {
    return executions
      .filter((e) => e.status !== "pending")
      .slice(-5)
      .reverse()
  }

  const recentExecutions = getRecentExecutions(reminder.executions)

  const handleClose = () => {
    setIsEditMode(false)
    onClose()
  }

  const handleSave = () => {
    // TODO: Implement save logic
    console.log("[v0] Saving changes")
    setIsEditMode(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 !grid-rows-[auto_1fr_auto] overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border bg-background row-start-1">
            <DialogTitle className="flex items-center justify-between">
              <span>{isEditMode ? "Editar" : "Detalles"} - {reminder.medicine?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className="ml-2"
              >
                {isEditMode ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
            </DialogTitle>
          </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto min-h-0 px-6 py-4 row-start-2">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-44 bg-gradient-to-b from-cream/30 to-cream/50 rounded-2xl border-3 border-primary flex items-end justify-center overflow-hidden shadow-lg">
                  {reminder.medicine && (
                    <>
                      <div
                        className="w-full bg-gradient-to-b from-primary to-primary/80 transition-all duration-700"
                        style={{
                          height: `${(reminder.medicine.tablets_left! / reminder.medicine.total_tablets!) * 100}%`,
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Pill
                          className={`w-12 h-12 ${
                            (reminder.medicine.tablets_left! / reminder.medicine.total_tablets!) * 100 < 30
                              ? "text-primary/40"
                              : "text-white/60"
                          }`}
                        />
                        <span
                          className={`font-bold text-2xl mt-2 ${
                            (reminder.medicine.tablets_left! / reminder.medicine.total_tablets!) * 100 < 30
                              ? "text-primary"
                              : "text-white"
                          }`}
                        >
                          {reminder.medicine.tablets_left}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-center mt-3 text-sm font-semibold">
                  de {reminder.medicine?.total_tablets} pastillas
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nombre</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      defaultValue={reminder.medicine?.name}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-foreground">{reminder.medicine?.name}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Dosis</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        defaultValue={reminder.medicine?.dosage || ""}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{reminder.medicine?.dosage || "No especificada"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Por dosis</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        defaultValue={reminder.medicine?.tablets_per_dose}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{reminder.medicine?.tablets_per_dose} pastilla(s)</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Total de pastillas</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        defaultValue={reminder.medicine?.total_tablets || 0}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{reminder.medicine?.total_tablets}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Pastillas restantes</label>
                    {isEditMode ? (
                      <input
                        type="number"
                        defaultValue={reminder.medicine?.tablets_left || 0}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{reminder.medicine?.tablets_left}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground">Configuración del Recordatorio</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Estado</label>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        reminder.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {reminder.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Periodicidad</label>
                  {isEditMode ? (
                    <select
                      defaultValue={reminder.periodicity || ""}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option>Cada 8 horas</option>
                      <option>Cada 12 horas</option>
                      <option>Diario</option>
                      <option>Cada 2 días</option>
                      <option>Semanal</option>
                    </select>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{reminder.periodicity}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Fecha de inicio</label>
                  {isEditMode ? (
                    <input
                      type="date"
                      defaultValue={reminder.start_date}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {new Date(reminder.start_date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Fecha de fin (opcional)</label>
                  {isEditMode ? (
                    <input
                      type="date"
                      defaultValue={reminder.end_date || ""}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {reminder.end_date
                          ? new Date(reminder.end_date).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Sin fecha de fin"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Notas</label>
                {isEditMode ? (
                  <textarea
                    defaultValue={reminder.medicine?.notes || ""}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Agregar notas sobre el medicamento..."
                  />
                ) : (
                  <p className="mt-1 text-foreground text-sm">
                    {reminder.medicine?.notes || "Sin notas adicionales"}
                  </p>
                )}
              </div>
            </div>

            {recentExecutions.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Últimas 5 Ejecuciones</h3>
                <div className="space-y-3">
                  {recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(execution.executed_at).toLocaleString("es-ES")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {execution.duration_minutes} minutos
                          {execution.retries > 0 && ` • ${execution.retries} reintentos`}
                        </p>
                      </div>
                      {execution.status === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t border-border bg-background row-start-3">
            <div className="flex items-center justify-between w-full gap-3">
            {isEditMode ? (
              <>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={onDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditMode(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={handleSave}>
                    Guardar Cambios
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={onDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                  <Button variant="outline" onClick={() => onToggleActive(reminder)}>
                    <Power className="w-4 h-4 mr-2" />
                    {reminder.is_active ? "Desactivar" : "Activar"}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cerrar
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsEditMode(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </>
            )}
            </div>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
