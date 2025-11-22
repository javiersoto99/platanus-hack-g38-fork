"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  TodayTab,
  ConfigTab,
  MedicineDetailModal,
  DeleteConfirmationModal,
  ActivateReminderModal,
  Reminder,
} from "./components"
import { mockReminders, mockReminderInstances } from "./components/mockData"

export function RemindersView() {
  const [activeTab, setActiveTab] = useState<"today" | "config">("today")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [showMedicineDetail, setShowMedicineDetail] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)

  const handleToggleActive = (reminder: Reminder) => {
    if (reminder.is_active) {
      // Deactivate immediately
      console.log("[v0] Deactivating reminder", reminder.id)
    } else {
      // Show dialog to reactivate
      setSelectedReminder(reminder)
      setShowActivateDialog(true)
    }
  }

  const handleDeleteReminder = () => {
    console.log("[v0] Deleting reminder", selectedReminder?.id)
    setShowDeleteDialog(false)
    setShowMedicineDetail(false)
  }

  const handleCardClick = (reminder: Reminder) => {
    setSelectedReminder(reminder)
    setShowMedicineDetail(true)
  }

  const handleShowDeleteDialog = () => {
    setShowDeleteDialog(true)
  }

  const handleActivateReminder = () => {
    console.log("[v0] Activating reminder", selectedReminder?.id)
    setShowActivateDialog(false)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Recordatorios</h2>
            <p className="text-muted-foreground mt-1">Gestiona los recordatorios de medicinas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => setActiveTab("today")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "today" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hoy
            {activeTab === "today" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "config" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Configuración
            {activeTab === "config" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
          </button>
        </div>
      </div>

      {activeTab === "today" && <TodayTab reminderInstances={mockReminderInstances} />}

      {activeTab === "config" && (
        <ConfigTab
          reminders={mockReminders}
          searchQuery={searchQuery}
          filterActive={filterActive}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilterActive}
          onCardClick={handleCardClick}
          onToggleActive={handleToggleActive}
        />
      )}

      <MedicineDetailModal
        isOpen={showMedicineDetail}
        onClose={() => setShowMedicineDetail(false)}
        reminder={selectedReminder}
        onDelete={handleShowDeleteDialog}
        onToggleActive={handleToggleActive}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        reminder={selectedReminder}
        onConfirm={handleDeleteReminder}
      />

      <ActivateReminderModal
        isOpen={showActivateDialog}
        onClose={() => setShowActivateDialog(false)}
        reminder={selectedReminder}
        onConfirm={handleActivateReminder}
      />
    </div>
  )
}
