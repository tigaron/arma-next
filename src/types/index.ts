export type PlayerColor = 'blue' | 'yellow' | 'green' | 'red';

// Color configuration
export const COLOR_CONFIG = {
  blue: {
    label: 'Blue',
    bgClass: 'bg-blue-700',
    borderClass: 'border-blue',
    headerBgClass: 'bg-blue-900',
    textClass: 'text-white',
    dragHandleClass: 'hover:bg-blue-200',
  },
  yellow: {
    label: 'Yellow',
    bgClass: 'bg-yellow-400',
    borderClass: 'border-yellow',
    headerBgClass: 'bg-yellow-600',
    textClass: 'text-white',
    dragHandleClass: 'hover:bg-yellow-200',
  },
  green: {
    label: 'Green',
    bgClass: 'bg-green-700',
    borderClass: 'border-green',
    headerBgClass: 'bg-green-900',
    textClass: 'text-white',
    dragHandleClass: 'hover:bg-green-200',
  },
  red: {
    label: 'Red',
    bgClass: 'bg-red-700',
    borderClass: 'border-red',
    headerBgClass: 'bg-red-900',
    textClass: 'text-white',
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
