import type { BattleSlot } from '~/server/db/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface BattleTimeProps {
  timeSlot: BattleSlot['label'] | undefined;
  allTimeSlots: BattleSlot[];
  onTimeChange: (newTimeSlot: BattleSlot['label']) => void;
}

export function BattleTime({
  timeSlot,
  allTimeSlots,
  onTimeChange,
}: BattleTimeProps) {
  return (
    <Select onValueChange={onTimeChange} defaultValue={timeSlot}>
      <SelectTrigger className="sm:w-[180px] w-full ml-auto cursor-pointer">
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {allTimeSlots.map((slot) => (
          <SelectItem key={slot.id} value={slot.label}>
            {slot.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
