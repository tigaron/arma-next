export type PlayerColor = 'blue' | 'yellow' | 'green' | 'red';

// Color configuration
export const COLOR_CONFIG = {
  blue: {
    label: 'Blue',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    headerBgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    dragHandleClass: 'hover:bg-blue-200',
  },
  yellow: {
    label: 'Yellow',
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-200',
    headerBgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    dragHandleClass: 'hover:bg-yellow-200',
  },
  green: {
    label: 'Green',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    headerBgClass: 'bg-green-100',
    textClass: 'text-green-800',
    dragHandleClass: 'hover:bg-green-200',
  },
  red: {
    label: 'Red',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    headerBgClass: 'bg-red-100',
    textClass: 'text-red-800',
    dragHandleClass: 'hover:bg-red-200',
  },
};

export const GUILD_BATTLE_TIME = 60 * 60; // 60 minutes in seconds

export type GuildBattleTimeSlot =
  | '21:00 – 22:00'
  | '1:00 – 2:00'
  | '4:00 – 5:00'
  | '11:00 – 12:00';

export const GUILD_BATTLE_TIME_SLOTS: GuildBattleTimeSlot[] = [
  '21:00 – 22:00',
  '1:00 – 2:00',
  '4:00 – 5:00',
  '11:00 – 12:00',
];

// Convert time slot to UTC hours
export const timeSlotToUTCHours = (timeSlot: GuildBattleTimeSlot): number => {
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

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]!;
};

// Get current month name
export const getCurrentMonthName = (): string => {
  return new Date().toLocaleString('default', { month: 'long' });
};

// Get current year
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};
