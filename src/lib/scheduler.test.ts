// src/lib/scheduler.test.ts
import { describe, it, expect } from "vitest";
import { scheduleJobs, timeToMinutes } from "./scheduler";
import type { Job, PowerCut } from "../types";
import casesFile from "./__fixtures__/P01_cases.json";

// The raw shape of each case in the JSON, as given by the organizers
interface RawJob {
  name: string;
  minutes: number;
  power: "grid" | "generator" | "none";
}
interface RawCut {
  start: string;
  end: string;
}
interface RawCase {
  case_id: string;
  shop_open: string;
  shop_close: string;
  cuts: RawCut[];
  jobs: RawJob[];
}

const cases = casesFile.cases as RawCase[];

describe("scheduleJobs against all public cases", () => {
  // it.each runs the same test body once per case, and names each run by case_id
  it.each(cases)("case $case_id behaves correctly", (rawCase) => {
    const shopOpenMinutes = timeToMinutes(rawCase.shop_open);
    const shopCloseMinutes = timeToMinutes(rawCase.shop_close);

    // Convert the raw JSON shape into the Job/PowerCut types our scheduler expects
    const powerCuts: PowerCut[] = rawCase.cuts.map((cut, i) => ({
      id: `cut-${i}`,
      startMinutes: timeToMinutes(cut.start),
      endMinutes: timeToMinutes(cut.end),
    }));

    const jobs: Job[] = rawCase.jobs.map((job, i) => ({
      id: `job-${i}`,
      name: job.name,
      durationMinutes: job.minutes,
      powerType: job.power,
      startMinutes: null,
    }));

    const result = scheduleJobs(jobs, powerCuts, shopOpenMinutes, shopCloseMinutes);
    const placed = result.jobs.filter((j) => j.startMinutes !== null);

    // CHECK 1: every placed job must fit inside shop hours (no negative start, no running past close)
    for (const job of placed) {
      const start = job.startMinutes as number;
      const end = start + job.durationMinutes;
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeLessThanOrEqual(shopCloseMinutes - shopOpenMinutes);
    }

    // CHECK 2: no two placed jobs overlap each other (single-resource shop, one job at a time)
    const sorted = [...placed].sort(
      (a, b) => (a.startMinutes as number) - (b.startMinutes as number)
    );
    for (let i = 1; i < sorted.length; i++) {
      const prevEnd = (sorted[i - 1].startMinutes as number) + sorted[i - 1].durationMinutes;
      const currStart = sorted[i].startMinutes as number;
      expect(currStart).toBeGreaterThanOrEqual(prevEnd);
    }

    // CHECK 3: no grid job overlaps any power cut — this is the core rule of the problem
    const gridJobs = placed.filter((j) => j.powerType === "grid");
    for (const job of gridJobs) {
      const jobStart = job.startMinutes as number;
      const jobEnd = jobStart + job.durationMinutes;
      for (const cut of powerCuts) {
        const cutStart = cut.startMinutes - shopOpenMinutes;
        const cutEnd = cut.endMinutes - shopOpenMinutes;
        // Two ranges do NOT overlap if one ends before the other starts
        const noOverlap = jobEnd <= cutStart || jobStart >= cutEnd;
        expect(noOverlap).toBe(true);
      }
    }

    // CHECK 4: the reported generator-minutes total matches what's actually placed
    const expectedGeneratorMinutes = placed
      .filter((j) => j.powerType === "generator")
      .reduce((sum, j) => sum + j.durationMinutes, 0);
    expect(result.totalGeneratorMinutes).toBe(expectedGeneratorMinutes);
  });
});