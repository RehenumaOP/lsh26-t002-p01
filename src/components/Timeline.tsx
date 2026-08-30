import type { Job, PowerCut } from "../types";

interface TimelineProps {
  shopOpenMinutes: number;
  shopCloseMinutes: number;
  powerCuts: PowerCut[];
  jobs: Job[]; // jobs that have already been scheduled (have startMinutes)
}

// Draws a simple horizontal 24hr-style bar.
// Power cuts show in red, scheduled jobs show as blue/gray blocks on top.
export default function Timeline({ shopOpenMinutes, shopCloseMinutes, powerCuts, jobs }: TimelineProps) {
  const dayLength = shopCloseMinutes - shopOpenMinutes;

  // Converts a minute offset into a left/width percentage for CSS positioning
  const toPercent = (minutes: number) => (minutes / dayLength) * 100;

  return (
    <div className="w-full">
      <p className="text-sm text-gray-500 mb-2">Timeline (shop hours)</p>

      {/* The base bar representing the whole open day */}
      <div className="relative w-full h-16 bg-gray-100 rounded-md overflow-hidden border border-gray-300">
        {/* Power cut blocks */}
        {powerCuts.map((cut) => (
          <div
            key={cut.id}
            className="absolute top-0 h-full bg-red-300"
            style={{
              left: `${toPercent(cut.startMinutes - shopOpenMinutes)}%`,
              width: `${toPercent(cut.endMinutes - cut.startMinutes)}%`,
            }}
            title="Power cut"
          />
        ))}

        {/* Scheduled job blocks, stacked on top */}
        {jobs
          .filter((job) => job.startMinutes !== null)
          .map((job) => (
            <div
              key={job.id}
              className={`absolute top-1/2 -translate-y-1/2 h-6 rounded text-xs text-white flex items-center px-1 overflow-hidden ${
                job.powerType === "grid"
                  ? "bg-blue-500"
                  : job.powerType === "generator"
                  ? "bg-yellow-600"
                  : "bg-gray-500"
              }`}
              style={{
                left: `${toPercent((job.startMinutes as number))}%`,
                width: `${toPercent(job.durationMinutes)}%`,
              }}
              title={`${job.name} (${job.durationMinutes} min)`}
            >
              {job.name}
            </div>
          ))}
      </div>

      {/* Simple legend so it's clear what colors mean */}
      <div className="flex gap-4 mt-2 text-xs text-gray-600">
        <span><span className="inline-block w-3 h-3 bg-red-300 mr-1" />Power cut</span>
        <span><span className="inline-block w-3 h-3 bg-blue-500 mr-1" />Grid job</span>
        <span><span className="inline-block w-3 h-3 bg-yellow-600 mr-1" />Generator job</span>
        <span><span className="inline-block w-3 h-3 bg-gray-500 mr-1" />No power job</span>
      </div>
    </div>
  );
}