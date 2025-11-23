"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Pill,
  Clock,
  Trash2,
  Power,
  Edit,
  Calendar,
} from "lucide-react"
import { Reminder } from "./types"
import { formatPeriodicity, parsePeriodicityToMinutes } from "@/lib/utils"
import { api } from "@/lib/api"

interface MedicineDetailModalProps {
  isOpen: boolean
  onClose: () => void
  reminder: Reminder | null
  onDelete: () => void
  onToggleActive: (reminder: Reminder) => void
  onSave?: () => void | Promise<void>
  isToggling?: boolean
  isDeleting?: boolean
}

export function MedicineDetailModal({
  isOpen,
  onClose,
  reminder,
  onDelete,
  onToggleActive,
  onSave,
  isToggling = false,
  isDeleting = false,
}: MedicineDetailModalProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Refs to get form values
  const nameRef = useRef<HTMLInputElement>(null)
  const dosageRef = useRef<HTMLInputElement>(null)
  const tabletsPerDoseRef = useRef<HTMLInputElement>(null)
  const totalTabletsRef = useRef<HTMLInputElement>(null)
  const tabletsLeftRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const periodicityRef = useRef<HTMLSelectElement>(null)
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)

  // Helper to map periodicity minutes to dropdown option value
  const getPeriodicityDropdownValue = (minutes: number | null | undefined): string => {
    if (!minutes) return "Diario" // Default to "Diario" if null/undefined
    if (minutes === 480) return "Cada 8 horas"
    if (minutes === 720) return "Cada 12 horas"
    if (minutes === 1440) return "Diario"
    if (minutes === 2880) return "Cada 2 días"
    if (minutes === 10080) return "Semanal"
    // Fallback: try to match closest option
    if (minutes < 720) return "Cada 8 horas"
    if (minutes < 1440) return "Cada 12 horas"
    if (minutes < 2880) return "Diario"
    if (minutes < 10080) return "Cada 2 días"
    return "Semanal"
  }

  if (!reminder) return null

  const medicine = reminder.medicineData
  const fillPercentage = medicine && medicine.total_tablets && medicine.tablets_left !== null
    ? (medicine.tablets_left / medicine.total_tablets) * 100
    : 0

  const handleClose = () => {
    setIsEditMode(false)
    onClose()
  }

  const handleSave = async () => {
    if (!reminder || !medicine) return
    
    setIsSaving(true)
    try {
      // Collect medicine updates
      const medicineUpdates: {
        name?: string
        dosage?: string | null
        tablets_per_dose?: number | null
        total_tablets?: number | null
        tablets_left?: number | null
        notes?: string | null
      } = {}
      if (nameRef.current?.value !== medicine.name) {
        medicineUpdates.name = nameRef.current?.value
      }
      if (dosageRef.current?.value !== (medicine.dosage || "")) {
        medicineUpdates.dosage = dosageRef.current?.value || null
      }
      if (tabletsPerDoseRef.current?.value !== String(medicine.tablets_per_dose ?? 1)) {
        medicineUpdates.tablets_per_dose = parseInt(tabletsPerDoseRef.current?.value || "1") || null
      }
      if (totalTabletsRef.current?.value !== String(medicine.total_tablets || 0)) {
        medicineUpdates.total_tablets = parseInt(totalTabletsRef.current?.value || "0") || null
      }
      if (tabletsLeftRef.current?.value !== String(medicine.tablets_left || 0)) {
        medicineUpdates.tablets_left = parseInt(tabletsLeftRef.current?.value || "0") || null
      }
      if (notesRef.current?.value !== (medicine.notes || "")) {
        medicineUpdates.notes = notesRef.current?.value || null
      }

      // Collect reminder updates
      const reminderUpdates: {
        periodicity?: number | null
        start_date?: string
        end_date?: string | null
      } = {}
      
      // Parse periodicity from select
      const periodicityText = periodicityRef.current?.value || ""
      const newPeriodicity = parsePeriodicityToMinutes(periodicityText)
      if (newPeriodicity !== reminder.periodicity) {
        reminderUpdates.periodicity = newPeriodicity
      }
      
      // Parse start date - need to include time from original start_date
      const startDateValue = startDateRef.current?.value
      if (startDateValue) {
        const startDateStr = reminder.start_date.split("T")[0]
        if (startDateValue !== startDateStr) {
          // Combine with existing time from start_date
          const timePart = reminder.start_date.includes("T") 
            ? reminder.start_date.split("T")[1]?.split(".")[0] || reminder.start_date.split("T")[1] || "00:00:00"
            : "00:00:00"
          reminderUpdates.start_date = `${startDateValue}T${timePart}`
        }
      }
      
      // Parse end date
      const endDateValue = endDateRef.current?.value || ""
      const currentEndDate = reminder.end_date ? reminder.end_date.split("T")[0] : ""
      if (endDateValue !== currentEndDate) {
        reminderUpdates.end_date = endDateValue || null
      }

      // Update medicine if there are changes
      if (Object.keys(medicineUpdates).length > 0) {
        await api.patchMedicine(medicine.id, medicineUpdates)
      }

      // Update reminder if there are changes
      if (Object.keys(reminderUpdates).length > 0) {
        await api.patchReminder(reminder.id, reminderUpdates)
      }

      setIsEditMode(false)
      
      // Refresh data via callback if provided
      if (onSave) {
        await onSave()
      }
    } catch (error) {
      console.error("Error saving changes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 !grid-rows-[auto_1fr_auto] overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border bg-background">
            <DialogTitle className="flex items-center justify-between">
              <span>{isEditMode ? "Editar" : "Detalles"} - {medicine?.name || "Sin medicina"}</span>
            </DialogTitle>
          </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto min-h-0 flex justify-center px-6 py-4">
          <div className="space-y-6 w-full">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-44 bg-gradient-to-b from-muted/30 to-muted/50 rounded-2xl border-2 border-primary flex items-end justify-center overflow-hidden shadow-lg">
                  {medicine && (
                    <>
                      <div
                        className="w-full bg-gradient-to-b from-primary to-primary/80 transition-all duration-700"
                        style={{
                          height: `${fillPercentage}%`,
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Pill
                          className={`w-12 h-12 ${
                            fillPercentage < 30
                              ? "text-primary/40"
                              : "text-white/60"
                          }`}
                        />
                        <span
                          className={`font-bold text-2xl mt-2 ${
                            fillPercentage < 30
                              ? "text-primary"
                              : "text-white"
                          }`}
                        >
                          {medicine.tablets_left ?? 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-center mt-3 text-sm font-semibold">
                  de {medicine?.total_tablets ?? 0} pastillas
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nombre</label>
                  {isEditMode ? (
                    <input
                      ref={nameRef}
                      type="text"
                      defaultValue={medicine?.name}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-foreground">{medicine?.name || "Sin medicina"}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Dosis</label>
                    {isEditMode ? (
                      <input
                        ref={dosageRef}
                        type="text"
                        defaultValue={medicine?.dosage || ""}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{medicine?.dosage || "No especificada"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Por dosis</label>
                    {isEditMode ? (
                      <input
                        ref={tabletsPerDoseRef}
                        type="number"
                        defaultValue={medicine?.tablets_per_dose ?? 1}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{medicine?.tablets_per_dose ?? 1} pastilla(s)</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Total de pastillas</label>
                    {isEditMode ? (
                      <input
                        ref={totalTabletsRef}
                        type="number"
                        defaultValue={medicine?.total_tablets || 0}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{medicine?.total_tablets ?? 0}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Pastillas restantes</label>
                    {isEditMode ? (
                      <input
                        ref={tabletsLeftRef}
                        type="number"
                        defaultValue={medicine?.tablets_left || 0}
                        className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{medicine?.tablets_left ?? 0}</p>
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
                      ref={periodicityRef}
                      defaultValue={getPeriodicityDropdownValue(reminder.periodicity)}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="Cada 8 horas">Cada 8 horas</option>
                      <option value="Cada 12 horas">Cada 12 horas</option>
                      <option value="Diario">Diario</option>
                      <option value="Cada 2 días">Cada 2 días</option>
                      <option value="Semanal">Semanal</option>
                    </select>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{formatPeriodicity(reminder.periodicity)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Fecha de inicio</label>
                  {isEditMode ? (
                    <input
                      ref={startDateRef}
                      type="date"
                      defaultValue={reminder.start_date.split("T")[0]}
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
                      ref={endDateRef}
                      type="date"
                      defaultValue={reminder.end_date ? reminder.end_date.split("T")[0] : ""}
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
                    ref={notesRef}
                    defaultValue={medicine?.notes || ""}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    placeholder="Agregar notas sobre el medicamento..."
                  />
                ) : (
                  <p className="mt-1 text-foreground text-sm">
                    {medicine?.notes || "Sin notas adicionales"}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t border-border bg-background row-start-3">
            <div className="flex items-center justify-center w-full gap-3">
            {isEditMode ? (
              <>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditMode(false)} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} loading={isSaving}>
                    Guardar Cambios
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsEditMode(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" onClick={() => onToggleActive(reminder)} loading={isToggling}>
                    <Power className="w-4 h-4 mr-2" />
                    {reminder.is_active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button variant="destructive" onClick={onDelete} loading={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
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
