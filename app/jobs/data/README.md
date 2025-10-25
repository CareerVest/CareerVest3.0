# Mock Job Data

This directory contains mock data for the Jobs Module that can be used for demo/testing purposes.

## How to Enable Mock Data

1. Open `/app/jobs/data/mockJobData.ts`
2. Change `ENABLE_MOCK_DATA = false` to `ENABLE_MOCK_DATA = true`
3. Save the file and refresh the jobs page

## How to Disable Mock Data (Use Real API)

1. Open `/app/jobs/data/mockJobData.ts`
2. Change `ENABLE_MOCK_DATA = true` to `ENABLE_MOCK_DATA = false`
3. Save the file and refresh the jobs page

## What's Included

The mock data includes:

- **1 Client** (Amit Patel) with an active batch
- **1 Active Batch** (BATCH-2025-001) with 50 jobs
- **5 Sample Jobs** with realistic data:
  - Senior Full Stack Engineer at TechCorp (92% match)
  - Frontend Developer at Innovate Labs (88% match)
  - TypeScript Engineer at DataFlow Inc (85% match)
  - Full Stack Engineer at CloudScale (82% match)
  - React Native Developer at MobileFirst Inc (78% match)

Each job includes:
- Full job description with HTML formatting
- Salary ranges
- Location and remote options
- Match scores
- AI summaries
- Posted dates and deadlines

## How It Works

When `ENABLE_MOCK_DATA = true`, the following API functions will return mock data:
- `getClientsWithBatches()` - Returns mock client with batch
- `getClientBatch()` - Returns mock batch details
- `getBatchItems()` - Returns 5 sample jobs

All other API calls (apply, skip, etc.) will still hit the real backend, but they'll be operating on mock data so they won't actually save anything.

## Quick Demo

To quickly see the Jobs Module in action:

1. Enable mock data (set `ENABLE_MOCK_DATA = true`)
2. Go to `/jobs` page
3. You'll see Amit Patel's client in the dropdown
4. Select the client to see 5 sample jobs
5. Browse through jobs using keyboard shortcuts (N/P for next/previous)
6. Try applying or skipping jobs (these will call the real API but won't persist)

## Notes

- Mock data is only for the **Jobs Module** (recruiter view)
- Admin portal still uses real API data
- The mock data toggle is a simple boolean flag - no configuration files needed
- Safe to commit with `ENABLE_MOCK_DATA = false` (default)
