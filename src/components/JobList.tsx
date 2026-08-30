import type { Job } from "../types";

interface JobListProps {
  jobs: Job[];
  onRemoveJob: (id: string) => void;
}

// Shows every job added so far, with its scheduled status, and a delete button.
export default function JobList({ jobs, onRemoveJob }: JobListProps) {
  return (
    <ul className="divide-y divide-gray-200 border rounded">
      {jobs.map((job) => (
        <li key={job.id} className="flex justify-between items-center px-3 py-2 text-sm">
          <div>
            <span className="font-medium">{job.name}</span>{" "}
            <span className="text-gray-500">
              ({job.durationMinutes} min, {job.powerType})
            </span>
            {job.startMinutes === null && (
              <span className="text-red-500 ml-2">— could not be scheduled</span>
            )}
          </div>
          <button
            onClick={() => onRemoveJob(job.id)}
            className="text-red-500 text-xs hover:underline"
          >
            Remove
          </button>
        </li>
      ))}
      {jobs.length === 0 && (
        <li className="px-3 py-2 text-sm text-gray-400">No jobs added yet.</li>
      )}
    </ul>
  );
}