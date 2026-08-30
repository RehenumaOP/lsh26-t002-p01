// Shared type definitions used across the app

export type PowerType = "grid" | "generator" | "none";

export interface Job {
  id: string;
  name: string;
  durationMinutes: number;
  powerType: PowerType;
  // Filled in after scheduling — null means "not placed yet"
  startMinutes: number | null; // minutes since shop_open, e.g. 90 = 1.5 hrs after open
}

export interface PowerCut {
  id: string;
  startMinutes: number; // minutes since shop_open
  endMinutes: number;
}

export interface ScheduleResult {
  jobs: Job[]; // same jobs, now with startMinutes filled in (or null if unscheduled)
  totalGeneratorMinutes: number;
}