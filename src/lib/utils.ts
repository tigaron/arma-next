import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { BattleSlot } from '~/server/db/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const timeSlotToUTCHours = (timeSlot: BattleSlot['label']): number => {
  switch (timeSlot) {
    case '21:00 – 22:00':
      return 21;
    case '1:00 – 2:00':
      return 1;
    case '4:00 – 5:00':
      return 4;
    case '11:00 – 12:00':
      return 11;
    default:
      return 21; // Default to 21:00
  }
};
