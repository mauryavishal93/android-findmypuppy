// Daily Check-In / Puppy Growth Types

export interface DailyCheckInData {
  lastCheckInDate: string | null;
  checkInStreak: number;
  totalCheckIns: number;
  hasCheckedInToday: boolean;
  puppyAge: number; // 0-7 days
  puppySize: number; // 1.0 to ~2.0
}
