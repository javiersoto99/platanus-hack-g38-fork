"use client"

import { useState } from "react"
import clsx from "clsx"
import { MonthlyCalendarView } from "@/app/components/calendar/monthly-calendar-view"
import { DailyCalendarView } from "@/app/components/calendar/daily-calendar-view"
import { EventDetailModal } from "./event-detail-modal"
import { mockEvents } from "@/app/components/calendar/mock-data"
import type { CalendarEvent } from "@/app/components/calendar/types"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 15))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [hoveredDate, setHoveredDate] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const getEventsForDay = (day: number) => mockEvents.filter((event) => event.date === day)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    setSelectedDay(null)
  }

  const handleDayClick = (day: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedDay(day)
      setSelectedEvent(null)
      setIsTransitioning(false)
    }, 300)
  }

  const handleBackToMonth = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedDay(null)
      setSelectedEvent(null)
      setIsTransitioning(false)
    }, 300)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleCloseModal = () => {
    setSelectedEvent(null)
  }

  if (selectedDay === null) {
    return (
      <div
        className={clsx(
          "transition-all duration-300",
          isTransitioning ? "animate-out zoom-out-95 fade-out" : "animate-in zoom-in-100 fade-in",
        )}
      >
        <MonthlyCalendarView
          currentDate={currentDate}
          onPreviousMonth={previousMonth}
          onNextMonth={nextMonth}
          onDayClick={handleDayClick}
          getEventsForDay={getEventsForDay}
          hoveredDate={hoveredDate}
          setHoveredDate={setHoveredDate}
        />
      </div>
    )
  }

  const dayEvents = getEventsForDay(selectedDay)

  return (
    <>
      <div
        className={clsx(
          "transition-all duration-300",
          isTransitioning ? "animate-out zoom-out-95 fade-out" : "animate-in zoom-in-105 fade-in",
        )}
      >
        <DailyCalendarView
          currentDate={currentDate}
          selectedDay={selectedDay}
          dayEvents={dayEvents}
          onBackToMonth={handleBackToMonth}
          onEventClick={handleEventClick}
        />
      </div>

      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={handleCloseModal} />}
    </>
  )
}
