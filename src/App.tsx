import { useState, useMemo } from "react";
import type { Job, PowerCut, PowerType } from "./types";
import { timeToMinutes, scheduleJobs } from "./lib/scheduler";
import Timeline from "./components/Timeline";
import JobForm from "./components/JobForm";
import JobList from "./components/JobList";

export default function App() {
  // Shop hours — hardcoded for now, could become inputs later
  const [shopOpen] = useState("09:00");
  const [shopClose] = useState("21:00");

  const [powerCuts, setPowerCuts] = useState<PowerCut[]>([]);
  const [cutStart, setCutStart] = useState("");
  const [cutEnd, setCutEnd] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);

  const shopOpenMinutes = timeToMinutes(shopOpen);
  const shopCloseMinutes = timeToMinutes(shopClose);

  // Add a new power cut from the two time inputs
  const handleAddCut = () => {
    if (!cutStart || !cutEnd) return;
    setPowerCuts([
      ...powerCuts,
      {
        id: crypto.randomUUID(),
        startMinutes: timeToMinutes(cutStart),
        endMinutes: timeToMinutes(cutEnd),
      },
    ]);
    setCutStart("");
    setCutEnd("");
  };

  const handleAddJob = (name: string, durationMinutes: number, powerType: PowerType) => {
    setJobs([
      ...jobs,
      { id: crypto.randomUUID(), name, durationMinutes, powerType, startMinutes: null },
    ]);
  };

  const handleRemoveJob = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  // Recalculate the schedule any time jobs or power cuts change.
  // useMemo avoids re-running this on every unrelated re-render.
  const { jobs: scheduledJobs, totalGeneratorMinutes } = useMemo(
    () => scheduleJobs(jobs, powerCuts, shopOpenMinutes, shopCloseMinutes),
    [jobs, powerCuts, shopOpenMinutes, shopCloseMinutes]
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Load-Shedding Window Planner</h1>

      {/* Bullet 1: enter power cuts */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2">Power cuts today</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="time"
            className="border rounded px-2 py-1"
            value={cutStart}
            onChange={(e) => setCutStart(e.target.value)}
          />
          <input
            type="time"
            className="border rounded px-2 py-1"
            value={cutEnd}
            onChange={(e) => setCutEnd(e.target.value)}
          />
          <button onClick={handleAddCut} className="bg-red-500 text-white px-3 py-1 rounded">
            Add cut
          </button>
        </div>

        <Timeline
          shopOpenMinutes={shopOpenMinutes}
          shopCloseMinutes={shopCloseMinutes}
          powerCuts={powerCuts}
          jobs={scheduledJobs}
        />
      </section>

      {/* Bullet 2: add jobs */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2">Jobs</h2>
        <JobForm onAddJob={handleAddJob} />
        <JobList jobs={scheduledJobs} onRemoveJob={handleRemoveJob} />
      </section>

      {/* Bullet 4: live generator minutes total */}
      <section className="bg-yellow-50 border border-yellow-300 rounded p-3">
        <p className="font-medium">
          Total generator minutes needed: <span className="text-lg">{totalGeneratorMinutes}</span>
        </p>
      </section>
    </div>
  );
}