import type { Job, PowerCut, ScheduleResult } from "../types";

// Converts "HH:MM" into minutes since midnight, e.g. "09:30" -> 570
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// The core scheduling logic.
// Strategy: place all grid jobs first (they must avoid power cuts),
// then fill in generator/none jobs anywhere still free.
export function scheduleJobs(
  jobs: Job[],
  powerCuts: PowerCut[],
  shopOpenMinutes: number,
  shopCloseMinutes: number
): ScheduleResult {
  const dayLength = shopCloseMinutes - shopOpenMinutes;

  // Step 1: find the "safe" windows for grid jobs (whole day minus power cuts)
  const sortedCuts = [...powerCuts].sort((a, b) => a.startMinutes - b.startMinutes);
  const safeWindows: { start: number; end: number }[] = [];
  let cursor = 0; // relative to shopOpenMinutes

  for (const cut of sortedCuts) {
    const cutStart = cut.startMinutes - shopOpenMinutes;
    const cutEnd = cut.endMinutes - shopOpenMinutes;
    if (cutStart > cursor) {
      safeWindows.push({ start: cursor, end: cutStart });
    }
    cursor = Math.max(cursor, cutEnd);
  }
  if (cursor < dayLength) {
    safeWindows.push({ start: cursor, end: dayLength });
  }

  const gridJobs = jobs.filter((j) => j.powerType === "grid");
  const otherJobs = jobs.filter((j) => j.powerType !== "grid");

  const placed: Job[] = [];

  // Step 2: place grid jobs into the earliest safe window with enough room
  for (const job of gridJobs) {
    let placedJob = false;
    for (const window of safeWindows) {
      const available = window.end - window.start;
      if (available >= job.durationMinutes) {
        placed.push({ ...job, startMinutes: window.start });
        window.start += job.durationMinutes; // shrink the window from the front
        placedJob = true;
        break;
      }
    }
    if (!placedJob) {
      placed.push({ ...job, startMinutes: null }); // couldn't fit — mark unscheduled
    }
  }

  // Step 3: figure out what's free now (whole day minus grid jobs already placed)
  const occupied = placed
    .filter((j) => j.startMinutes !== null)
    .map((j) => ({ start: j.startMinutes as number, end: (j.startMinutes as number) + j.durationMinutes }))
    .sort((a, b) => a.start - b.start);

  const freeWindows: { start: number; end: number }[] = [];
  let freeCursor = 0;
  for (const block of occupied) {
    if (block.start > freeCursor) {
      freeWindows.push({ start: freeCursor, end: block.start });
    }
    freeCursor = Math.max(freeCursor, block.end);
  }
  if (freeCursor < dayLength) {
    freeWindows.push({ start: freeCursor, end: dayLength });
  }

  // Step 4: place generator/none jobs into free windows — no cut-avoidance needed
  for (const job of otherJobs) {
    let placedJob = false;
    for (const window of freeWindows) {
      const available = window.end - window.start;
      if (available >= job.durationMinutes) {
        placed.push({ ...job, startMinutes: window.start });
        window.start += job.durationMinutes;
        placedJob = true;
        break;
      }
    }
    if (!placedJob) {
      placed.push({ ...job, startMinutes: null });
    }
  }

  // Bullet 4: total generator minutes, only counting jobs that were actually placed
  const totalGeneratorMinutes = placed
    .filter((j) => j.powerType === "generator" && j.startMinutes !== null)
    .reduce((sum, j) => sum + j.durationMinutes, 0);

  return { jobs: placed, totalGeneratorMinutes };
}