"use client"

import { useState, useEffect, useCallback } from "react"
import clsx from "clsx"
import { MonthlyCalendarView } from "@/app/components/calendar/monthly-calendar-view"
import { DailyCalendarView } from "@/app/components/calendar/daily-calendar-view"
import { EventDetailModal } from "./event-detail-modal"
import { CalendarSkeleton } from "./calendar-skeleton"
import { getCalendarEventsForMonth, getEventsForDay } from "@/lib/calendar"
import type { CalendarEvent } from "@/app/components/calendar/types"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [hoveredDate, setHoveredDate] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const monthEvents = await getCalendarEventsForMonth(
        currentDate.getFullYear(),
        currentDate.getMonth()
      )
      setEvents(monthEvents)
    } catch (error) {
      console.error("Error loading calendar events:", error)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.getFullYear(), currentDate.getMonth()])

  // Load events when month changes
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const getEventsForDayWrapper = (day: number) => getEventsForDay(events, day)

  const previousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    setCurrentDate(newDate)
    setSelectedDay(null)
    setLoading(true) // Show loading when changing months
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    setCurrentDate(newDate)
    setSelectedDay(null)
    setLoading(true) // Show loading when changing months
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

  if (loading) {
    return <CalendarSkeleton />
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
          getEventsForDay={getEventsForDayWrapper}
          hoveredDate={hoveredDate}
          setHoveredDate={setHoveredDate}
        />
      </div>
    )
  }

  const dayEvents = getEventsForDayWrapper(selectedDay)

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
