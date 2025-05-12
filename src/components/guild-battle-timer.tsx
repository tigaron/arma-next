"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { CalendarIcon, AlertCircle } from "lucide-react"
import {
  GUILD_BATTLE_TIME_SLOTS,
  GUILD_BATTLE_TIME,
  type GuildBattleTimeSlot,
  timeSlotToUTCHours,
  formatDate,
  getCurrentMonthName,
  getCurrentYear,
} from "~/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateGuildBattleTimeSlotApi, updateGuildBattleDatesApi } from "~/server/api-client"
import { addDays, format, isSameDay } from "date-fns"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { isDateInRange } from "react-day-picker"
interface GuildBattleTimerProps {
  timeSlot: GuildBattleTimeSlot | undefined
  battleDates: string[]
  isAdmin: boolean
}

export function GuildBattleTimer({ timeSlot, battleDates, isAdmin }: GuildBattleTimerProps) {
  const queryClient = useQueryClient()
  const [remainingTime, setRemainingTime] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: battleDates.length > 0 ? new Date(battleDates[0]) : undefined,
    to: battleDates.length > 0 ? new Date(battleDates[battleDates.length - 1]) : undefined,
  })
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const updateTimeSlotMutation = useMutation({
    mutationFn: updateGuildBattleTimeSlotApi,
    onSuccess: (updatedTimeSlot) => {
      queryClient.setQueryData(["guildBattleTimeSlot"], updatedTimeSlot)
    },
  })

  const updateBattleDatesMutation = useMutation({
    mutationFn: updateGuildBattleDatesApi,
    onSuccess: (updatedDates) => {
      queryClient.setQueryData(["guildBattleDates"], updatedDates)
      if (updatedDates.length > 0) {
        setDateRange({
          from: new Date(updatedDates[0]),
          to: new Date(updatedDates[updatedDates.length - 1]),
        })
      }
    },
  })

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "00:00:00"

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  const calculateTimeRemaining = (): number => {
    // If no time slot is set, return 0
    if (!timeSlot) return 0

    const now = new Date()
    const todayDate = formatDate(now)

    // Check if today is a battle day
    const isBattleDay = battleDates.includes(todayDate)

    if (!isBattleDay) {
      setIsActive(false)

      // Find the next battle date
      const futureBattleDates = battleDates
        .filter((date) => new Date(date) > now)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

      if (futureBattleDates.length === 0) {
        // No future dates this month, show a long countdown
        return 24 * 3600 // Just show 24 hours
      }

      const nextBattleDate = new Date(futureBattleDates[0])
      const battleHour = timeSlotToUTCHours(timeSlot)

      // Set the battle time
      nextBattleDate.setUTCHours(battleHour, 0, 0, 0)

      // Calculate seconds until next battle
      const secondsUntilNextBattle = Math.floor((nextBattleDate.getTime() - now.getTime()) / 1000)
      return Math.max(0, secondsUntilNextBattle)
    }

    // It's a battle day, check if the battle is happening now
    const utcHour = now.getUTCHours()
    const utcMinute = now.getUTCMinutes()
    const utcSecond = now.getUTCSeconds()
    const battleHour = timeSlotToUTCHours(timeSlot)

    // Calculate seconds until the battle starts
    if (utcHour < battleHour) {
      // Battle is later today
      const secondsUntilStart = (battleHour - utcHour) * 3600 - utcMinute * 60 - utcSecond
      setIsActive(false)
      return secondsUntilStart
    } else if (utcHour === battleHour) {
      // Check if battle is in progress
      const elapsedSeconds = utcMinute * 60 + utcSecond
      if (elapsedSeconds < GUILD_BATTLE_TIME) {
        // Battle is in progress
        setIsActive(true)
        return GUILD_BATTLE_TIME - elapsedSeconds
      }
    }

    // Battle is over for today, find next battle date
    setIsActive(false)
    const futureBattleDates = battleDates
      .filter((date) => new Date(date) > now)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    if (futureBattleDates.length === 0) {
      // No future dates this month, show a long countdown
      return 24 * 3600 // Just show 24 hours
    }

    const nextBattleDate = new Date(futureBattleDates[0])
    nextBattleDate.setUTCHours(battleHour, 0, 0, 0)

    // Calculate seconds until next battle
    const secondsUntilNextBattle = Math.floor((nextBattleDate.getTime() - now.getTime()) / 1000)
    return Math.max(0, secondsUntilNextBattle)
  }

  useEffect(() => {
    // Initial calculation
    setRemainingTime(calculateTimeRemaining())

    // Set up interval to update every second
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // Recalculate when timer reaches zero
          return calculateTimeRemaining()
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timeSlot, battleDates])

  const handleTimeSlotChange = (newTimeSlot: string) => {
    updateTimeSlotMutation.mutate(newTimeSlot as GuildBattleTimeSlot)
  }

  // Custom day selection handler
  const handleDayClick = (day: Date) => {
    // Set the start date to the clicked day
    const startDate = new Date(day)
    // Set the end date to 2 days after the start date
    const endDate = addDays(startDate, 2)

    const newRange = {
      from: startDate,
      to: endDate,
    }

    setDateRange(newRange)

    // Generate 3 consecutive days
    const dates = [formatDate(startDate), formatDate(addDays(startDate, 1)), formatDate(endDate)]

    updateBattleDatesMutation.mutate(dates)
  }

  // Find the next battle date
  const getNextBattleInfo = (): { date: string; isToday: boolean } => {
    if (!timeSlot || battleDates.length === 0) {
      return {
        date: "No battles scheduled",
        isToday: false,
      }
    }

    const now = new Date()
    const todayDate = formatDate(now)

    // Check if today is a battle day
    if (battleDates.includes(todayDate)) {
      const battleHour = timeSlotToUTCHours(timeSlot)
      const currentHour = now.getUTCHours()

      // If battle hasn't happened yet today or is happening now
      if (currentHour < battleHour || (currentHour === battleHour && isActive)) {
        return {
          date: todayDate,
          isToday: true,
        }
      }
    }

    // Find the next battle date
    const futureBattleDates = battleDates
      .filter((date) => new Date(date) > now)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    if (futureBattleDates.length === 0) {
      return {
        date: "No upcoming battles scheduled",
        isToday: false,
      }
    }

    return {
      date: futureBattleDates[0],
      isToday: false,
    }
  }

  const formatDateForDisplay = (dateString: string): string => {
    if (dateString === "No upcoming battles scheduled" || dateString === "No battles scheduled") return dateString

    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
  }

  const formatDateRange = (): string => {
    if (!dateRange.from) return "No dates selected"

    const startDate = formatDateForDisplay(formatDate(dateRange.from))

    if (!dateRange.to) return startDate

    const endDate = formatDateForDisplay(formatDate(dateRange.to))
    return `${startDate} - ${endDate}`
  }

  const nextBattleInfo = getNextBattleInfo()

  // Custom component to render the day cell with selection logic
  const renderDay = (day: Date) => {
    // Check if this day is part of the selected range
    let isSelected = false
    let isRangeStart = false
    let isRangeEnd = false

    if (dateRange.from && dateRange.to) {
      const date = new Date(day)
      isSelected =
        (date >= dateRange.from && date <= dateRange.to) ||
        isSameDay(date, dateRange.from) ||
        isSameDay(date, dateRange.to)
      isRangeStart = isSameDay(date, dateRange.from)
      isRangeEnd = isSameDay(date, dateRange.to)
    }

    return (
      <div
        className={`
          relative w-full h-full p-0
          ${isSelected ? "bg-primary text-primary-foreground" : ""}
          ${isRangeStart ? "rounded-l-md" : ""}
          ${isRangeEnd ? "rounded-r-md" : ""}
        `}
      >
        {format(day, "d")}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-center flex justify-between items-center">
          <span>Guild Battle Timer</span>
          {isAdmin && (
            <Select onValueChange={handleTimeSlotChange} defaultValue={timeSlot}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {GUILD_BATTLE_TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          {!timeSlot || battleDates.length === 0 ? (
            isAdmin ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please set the battle time and dates to activate the guild battle timer.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No guild battles are currently scheduled.</AlertDescription>
              </Alert>
            )
          ) : (
            <>
              <div className="text-5xl font-mono font-bold tabular-nums mb-2">{formatTime(remainingTime)}</div>
              <div className="text-sm text-muted-foreground">
                {isActive ? (
                  <span className="text-red-600 font-semibold">Battle in progress!</span>
                ) : (
                  <span>
                    Next battle: {nextBattleInfo.isToday ? "Today" : formatDateForDisplay(nextBattleInfo.date)},{" "}
                    {timeSlot} UTC
                  </span>
                )}
              </div>
            </>
          )}

          {isAdmin && (
            <div className="mt-4 border-t pt-4 w-full">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium mb-2">
                  Battle Dates ({getCurrentMonthName()} {getCurrentYear()}):
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {battleDates.map((date, index) => (
                    <div key={date} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      Day-{index+1} [{formatDateForDisplay(date)}]
                    </div>
                  ))}
                  {battleDates.length === 0 && <div className="text-sm text-muted-foreground">No dates selected</div>}
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>Select Battle Dates: {formatDateRange()}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      timeZone="UTC"
                      selected={dateRange}
                      onDayClick={handleDayClick}
                      numberOfMonths={1}
                      disabled={{
                        before: new Date(),
                      }}
                      modifiers={{
                        selected: dateRange,
                        range_start: dateRange?.from,
                        range_end: dateRange?.to,
                      }}
                      footer={
                        !dateRange.from && (
                          <div className="px-4 py-2 text-sm text-center text-muted-foreground">
                            Please select a start date.
                          </div>
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
