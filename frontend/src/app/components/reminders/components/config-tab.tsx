"use client"

import { Button } from "@/components/ui/button"
import { Search, Pill } from "lucide-react"
import { ReminderCard } from "./reminder-card"
import { Reminder } from "./types"

interface ConfigTabProps {
  reminders: Reminder[]
  searchQuery: string
  filterActive: boolean | null
  onSearchChange: (query: string) => void
  onFilterChange: (filter: boolean | null) => void
  onCardClick: (reminder: Reminder) => void
  onToggleActive: (reminder: Reminder) => void
}

export function ConfigTab({
  reminders,
  searchQuery,
  filterActive,
  onSearchChange,
  onFilterChange,
  onCardClick,
  onToggleActive,
}: ConfigTabProps) {
  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = reminder.medicine?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterActive === null || reminder.is_active === filterActive
    return matchesSearch && matchesFilter
  })

  return (
    <>
      {/* Search and Filters */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar medicina..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button
            variant={filterActive === true ? "default" : "outline"}
            onClick={() => onFilterChange(filterActive === true ? null : true)}
          >
            Activos
          </Button>
          <Button
            variant={filterActive === false ? "default" : "outline"}
            onClick={() => onFilterChange(filterActive === false ? null : false)}
          >
            Inactivos
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onCardClick={onCardClick}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>

        {filteredReminders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Pill className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">No se encontraron recordatorios</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? "Intenta con otro término de búsqueda" : "Crea tu primer recordatorio"}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
