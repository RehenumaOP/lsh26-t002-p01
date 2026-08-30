# Load-Shedding Window Planner

Solution for **LofiStack Hackathon 2026 — P01**

## Project information

- **Team:** `<404-Hope-Not-Found>`
- **Team ID:** `LSH26-T002`
- **Problem:** `P01 — Load-Shedding Window Planner`
- **Live application:** <https://lsh26-t002-p01.netlify.app>
- **Demo video:** https://www.loom.com/share/c3184a6f496949f3825f6f5d5a71db43

> Judges will evaluate only the exact commit SHA entered in the Final Submission Form.

## Solution summary

A scheduling tool for a shop facing planned power cuts. The user enters today's power-cut windows and a list of jobs, each needing grid power, generator power, or no power. The app automatically places every job on a 24-hour timeline so that grid-dependent jobs never fall inside a power cut, and shows the total generator minutes the resulting plan needs, updating live as jobs are added or removed.

## Requirements

| Requirement | Status | Where to verify |
|---|---|---|
| R1 — Enter power cut times, shown on a 24hr timeline | Complete | "Power cuts today" section, top of the page |
| R2 — Add jobs with name, duration, and power need | Complete | "Jobs" section — the add-job form |
| R3 — Auto-place jobs on the timeline, grid jobs avoid power cuts | Complete | Timeline bar updates immediately after adding a job |
| R4 — Live total of generator minutes needed | Complete | Yellow box at the bottom of the page |

## How to test the application

1. Open the live application.
2. Add one or two power cuts using the time pickers (e.g. 11:00–13:00).
3. Add a few jobs with different power types (grid, generator, none) and durations.
4. Watch the timeline place each job automatically, and the generator-minutes total update after each add or remove.

### Test or sample data

The organizer's published `P01_load_shedding_public.json` fixture was used during development to verify correctness — see `src/lib/__fixtures__/P01_cases.json` and the automated test in `src/lib/scheduler.test.ts`, which checks the scheduler against all 25 public cases (no overlaps, no grid job inside a power cut, correct generator-minute totals). To try it manually, type any case's `shop_open`/`shop_close`, cuts and jobs directly into the form. Reset by refreshing the page — the app holds data only in memory, by design (no persistence needed for this problem).

## Run locally

### Requirements

- Node.js 18+ and npm

### Setup

```bash
git clone <PUBLIC-REPOSITORY-URL>
cd lsh26-t002-p01
npm install
npm run dev
```

No environment variables or database are required — this problem doesn't need persistence, so it runs entirely as a client-side app.

## Problem-solving approach

We read the problem statement twice before writing any code, then wrote out the 4 required items and a data model in plain language, and pushed that plan as a commit before touching the editor. The core insight: only grid-power jobs have a hard constraint (must avoid power cuts), so the scheduler places grid jobs first into the safe windows between cuts, then fills remaining free time with generator/none jobs, which have no placement restriction. This ordering guarantees a grid job is never trapped without a valid slot. The scheduler was verified against all 25 published sample cases with an automated test checking three invariants: no job overlaps a power cut incorrectly, no two jobs overlap each other, and the reported generator-minutes total is arithmetically correct.

## Technology used

- **Frontend:** React + TypeScript + Vite, Tailwind CSS v4
- **Backend:** None — not required for this problem, all logic runs client-side
- **Database:** None — no persistence needed; data lives in React state for the session
- **Deployment:** Netlify
- **Other material tools:** Vitest (automated testing)

See [`LICENSES.md`](LICENSES.md) for third-party materials.

## Team contributions

| Registered member | GitHub username | Major contribution | Evidence |
|---|---|---|---|
| <Rehenuma Tarin Tuhi> | `<RehenumaOP>` | Full implementation: scheduling algorithm, UI components, testing | `src/lib/scheduler.ts`, `src/components/` |

Commit count alone does not represent contribution.

## AI usage

Claude (Anthropic) was used as a coding assistant: to help design the scheduling algorithm, write the React components, debug TypeScript configuration errors, and write the automated test suite against the published sample cases. Every AI-generated code chunk was read and understood before being accepted, and the final scheduler was independently verified by running it against all 25 published fixture cases via automated tests, confirming no incorrect overlaps and correct generator-minute totals.

## Major design decisions

- **No database/backend used:** the problem only requires session-level state (enter data, see results) — adding Supabase or a server would add complexity without meeting any actual requirement.
- **Grid-first scheduling order:** grid jobs are placed before generator/none jobs specifically because only grid jobs have a hard timing constraint (avoiding power cuts); this ordering avoids ever painting a grid job into a corner.

## Known limitations

- Jobs are placed in the order they were added (first-fit), not optimized for minimal generator usage or minimal idle time — this was a deliberate scope choice to keep the MVP correct and simple within the time limit.
- Shop open/close times are not currently user-editable in the UI (hardcoded to 09:00–21:00) <UPDATE THIS LINE IF YOU ADD AN INPUT FOR IT>.

## Repository records

- [`EVENT.md`](EVENT.md) — event start code and pre-event-material declaration
- [`evaluation-manifest.json`](evaluation-manifest.json) — structured judging evidence
- [`LICENSES.md`](LICENSES.md) — frameworks, libraries, templates and assets