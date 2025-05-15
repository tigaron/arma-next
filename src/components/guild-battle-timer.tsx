'use client';

import { useQuery } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { GUILD_BATTLE_TIME } from '~/lib/constants';
import { timeSlotToUTCHours } from '~/lib/utils';
import {
  type GuildWithBattleSlot,
  fetchBattleTimeSlots,
} from '~/server/api-client';
import type { BattleSlot } from '~/server/db/schema';
import { BattleCalendar } from './battle-calendar';
import { BattleTime } from './battle-time';
import { Skeleton } from './ui/skeleton';

interface GuildBattleTimerProps {
  userId: string;
  guild: GuildWithBattleSlot;
  onUpdateTimeSlot: (newTimeSlot: BattleSlot['label']) => void;
  onUpdateBattleDates: (newRange: DateRange) => void;
}

export function GuildTimer({
  userId,
  guild,
  onUpdateTimeSlot,
  onUpdateBattleDates,
}: GuildBattleTimerProps) {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [nextBattleDate, setNextBattleDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [timeSlot, setTimeSlot] = useState<BattleSlot['label'] | undefined>(
    undefined,
  );

  const isAdmin = userId === guild.ownerId;

  const { data: allTimeSlots } = useQuery({
    queryKey: ['timeSlots'],
    queryFn: fetchBattleTimeSlots,
  });

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const calculateTimeRemaining = (): number => {
    if (!timeSlot || !dateRange.from) return -1;

    const now = new Date();

    // Check if today is within the selected range
    const isBattleDay =
      dateRange.from &&
      dateRange.to &&
      now >= new Date(dateRange.from) &&
      now <= new Date(dateRange.to);

    if (!isBattleDay) {
      setIsActive(false);

      // Find the next battle date
      const futureBattleDate =
        dateRange.from && dateRange.to
          ? new Date(dateRange.from) > now
            ? new Date(dateRange.from)
            : new Date(dateRange.to)
          : null;

      if (!futureBattleDate || futureBattleDate <= now) {
        // No future dates
        setNextBattleDate(null);
        return -1;
      }

      const battleHour = timeSlotToUTCHours(timeSlot);

      // Set the battle time
      futureBattleDate.setUTCHours(battleHour, 0, 0, 0);

      // Set the next battle date
      setNextBattleDate(futureBattleDate);

      // Calculate seconds until next battle
      const secondsUntilNextBattle = Math.floor(
        (futureBattleDate.getTime() - now.getTime()) / 1000,
      );
      return Math.max(0, secondsUntilNextBattle);
    }

    // It's a battle day, check if the battle is happening now
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const utcSecond = now.getUTCSeconds();
    const battleHour = timeSlotToUTCHours(timeSlot);

    // Calculate seconds until the battle starts
    if (utcHour < battleHour) {
      // Battle is later today
      const secondsUntilStart =
        (battleHour - utcHour) * 3600 - utcMinute * 60 - utcSecond;
      setIsActive(false);
      setNextBattleDate(now);
      return secondsUntilStart;
    }

    if (utcHour === battleHour) {
      // Check if battle is in progress
      const elapsedSeconds = utcMinute * 60 + utcSecond;
      if (elapsedSeconds < GUILD_BATTLE_TIME) {
        // Battle is in progress
        setIsActive(true);
        setNextBattleDate(now);
        return GUILD_BATTLE_TIME - elapsedSeconds;
      }
    }

    // Battle is over for today, check if there's a battle tomorrow
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    if (
      tomorrow >= new Date(dateRange.from) &&
      tomorrow <= new Date(dateRange.to!)
    ) {
      const battleHour = timeSlotToUTCHours(timeSlot);
      tomorrow.setUTCHours(battleHour, 0, 0, 0);
      setIsActive(false);
      setNextBattleDate(tomorrow);

      const secondsUntilNextBattle = Math.floor(
        (tomorrow.getTime() - now.getTime()) / 1000,
      );
      return Math.max(0, secondsUntilNextBattle);
    }

    // No upcoming battles
    setIsActive(false);
    setNextBattleDate(null);
    return -1;
  };

  useEffect(() => {
    // Initial calculation
    setRemainingTime(calculateTimeRemaining());

    // Set up interval to update every second
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // Recalculate when timer reaches zero
          return calculateTimeRemaining();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeSlot, dateRange]);

  useEffect(() => {
    if (guild.battleDates) {
      setDateRange(guild.battleDates);
    }

    if (guild.battleSlot?.label) {
      setTimeSlot(guild.battleSlot.label);
    }
  }, [guild]);

  const handleDayClick = (day: Date) => {
    const startDate = new Date(day);
    startDate.setUTCHours(0, 0, 0, 0); // Start at 00:00:00 UTC

    const endDate = addDays(startDate, 2);
    endDate.setUTCHours(23, 59, 59, 999); // End at 23:59:59 UTC

    const newRange: DateRange = {
      from: startDate,
      to: endDate,
    };

    setDateRange(newRange);
    onUpdateBattleDates(newRange);
  };

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <Card>
      {isAdmin && (
        <CardHeader>
          <CardTitle className="grid sm:grid-cols-2 grid-cols-1 gap-2">
            <BattleCalendar
              battleDates={dateRange}
              onDayClick={handleDayClick}
            />
            {!allTimeSlots?.length ? (
              <Skeleton className="h-8 sm:w-[180px] w-full ml-auto" />
            ) : (
              <BattleTime
                timeSlot={timeSlot}
                allTimeSlots={allTimeSlots}
                onTimeChange={onUpdateTimeSlot}
              />
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-col items-center justify-center mt-1">
          {!timeSlot || !dateRange.from ? (
            isAdmin ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please set the battle time and dates to activate the guild
                  battle timer.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No guild battles are currently scheduled.
                </AlertDescription>
              </Alert>
            )
          ) : remainingTime === -1 ? (
            <div className="text-muted-foreground text-sm">
              <span>No upcoming battle</span>
            </div>
          ) : (
            <>
              <div className="mb-2 font-bold font-mono text-5xl tabular-nums">
                {formatTime(remainingTime)}
              </div>
              <div className="text-muted-foreground text-sm">
                {isActive ? (
                  <span className="font-semibold text-red-600">
                    Battle in progress!
                  </span>
                ) : nextBattleDate ? (
                  <span>
                    Next battle:{' '}
                    {formatDateForDisplay(nextBattleDate.toISOString())},{' '}
                    {timeSlot} UTC
                  </span>
                ) : (
                  <span>No upcoming battle</span>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
