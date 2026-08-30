import { useState } from "react";
import type { PowerType } from "../types";

interface JobFormProps {
  onAddJob: (name: string, durationMinutes: number, powerType: PowerType) => void;
}

// A simple form to add one job at a time.
export default function JobForm({ onAddJob }: JobFormProps) {
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState("");
  const [powerType, setPowerType] = useState<PowerType>("grid");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !minutes) return; // basic guard against empty submits

    onAddJob(name.trim(), Number(minutes), powerType);

    // reset the form after adding
    setName("");
    setMinutes("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end mb-4">
      <div>
        <label className="block text-xs text-gray-500">Job name</label>
        <input
          className="border rounded px-2 py-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. A0 banner print"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500">Minutes</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="90"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500">Power needed</label>
        <select
          className="border rounded px-2 py-1"
          value={powerType}
          onChange={(e) => setPowerType(e.target.value as PowerType)}
        >
          <option value="grid">Grid</option>
          <option value="generator">Generator</option>
          <option value="none">None</option>
        </select>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">
        Add job
      </button>
    </form>
  );
}