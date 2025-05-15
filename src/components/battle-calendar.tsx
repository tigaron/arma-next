import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface BattleCalendarProps {
  battleDates: DateRange;
  onDayClick: (day: Date) => void;
}

export function BattleCalendar({
  battleDates,
  onDayClick,
}: BattleCalendarProps) {
  const formatDateForDisplay = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  };

  const formatDateRange = (): string => {
    if (!battleDates.from) return 'No dates selected';

    const startDate = formatDateForDisplay(new Date(battleDates.from));

    if (!battleDates.to) return startDate;

    const endDate = formatDateForDisplay(new Date(battleDates.to));

    return `${startDate} - ${endDate}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="sm:w-[180px] w-full mr-auto justify-start  cursor-pointer"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          timeZone="UTC"
          selected={battleDates}
          onDayClick={onDayClick}
          numberOfMonths={1}
          disabled={{
            before: new Date(),
          }}
          modifiers={{
            selected: battleDates,
            range_start: battleDates.from,
            range_end: battleDates.to,
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
