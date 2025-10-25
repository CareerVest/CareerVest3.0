# CAREERVEST JOBS MODULE - FRONTEND ARCHITECTURE DOCUMENTATION

**Version:** 2.1
**Last Updated:** October 24, 2025
**Framework:** Next.js 14.2.24 (App Router), React 18, TypeScript 5
**UI Library:** Tailwind CSS 3.4+, ShadCN UI Components
**Status:** Production-Ready with Phase 1-3 Enhancements + Configuration Management + Time Tracking

---

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
2. [Directory Structure](#2-directory-structure)
3. [Core Pages](#3-core-pages)
4. [Components](#4-components)
5. [Custom Hooks](#5-custom-hooks)
6. [Type Definitions](#6-type-definitions)
7. [API Actions](#7-api-actions)
8. [Data Flow](#8-data-flow)
9. [State Management](#9-state-management)
10. [New Features (Phase 1-3)](#10-new-features-phase-1-3)
11. [Latest Updates (v2.1)](#11-latest-updates-v21)
12. [Hidden Features](#12-hidden-features)
13. [Styling & Theme](#13-styling--theme)

---

## 1. ARCHITECTURE OVERVIEW

The Jobs Module frontend is built using Next.js 14 App Router with a component-based architecture. It follows modern React patterns with TypeScript for type safety and uses custom hooks for business logic separation.

### Key Technologies

- **Framework:** Next.js 14.2.x (App Router)
- **Language:** TypeScript 5.x
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3.x
- **Components:** ShadCN UI (Radix UI primitives)
- **HTTP Client:** Axios
- **Notifications:** Sonner (toast notifications)
- **Authentication:** Azure AD via authContext

### Architecture Patterns

- **Component-Driven:** Reusable, composable components
- **Custom Hooks:** Encapsulated business logic (useJobQueue, useBatchStats, useKeyboardShortcuts)
- **Server Actions:** API calls via dedicated actions layer
- **Type Safety:** Full TypeScript coverage with strict types
- **State Colocation:** Component-level state for UI, context for global state

---

## 2. DIRECTORY STRUCTURE

```
app/jobs/
├── page.tsx                          # Main recruiter view (batch review interface)
├── layout.tsx                        # Jobs module layout wrapper
├── types/
│   ├── jobs.ts                       # Job, Batch, Request/Response types
│   └── admin.ts                      # Admin dashboard types
├── actions/
│   └── jobsActions.ts                # API calls (Axios-based)
├── hooks/
│   ├── useJobQueue.ts                # Job navigation logic
│   ├── useBatchStats.ts              # Batch statistics calculations
│   └── useKeyboardShortcuts.ts       # Keyboard shortcuts (A, S, V, arrows)
├── components/
│   ├── JobsHeader.tsx                # Header with client selector & navigation
│   ├── JobCard.tsx                   # Job details display
│   ├── BatchPerformanceBar.tsx       # Progress bar with stats
│   ├── ActionButtons.tsx             # Skip/View/Apply actions
│   ├── MatchScoreBadge.tsx           # Match score indicator (0-100)
│   ├── FreshnessBadge.tsx            # ✅ NEW: Job freshness indicator
│   ├── ApplyConfirmationModal.tsx    # Confirm apply action
│   ├── SkipFeedbackModal.tsx         # Skip reason selection
│   └── ClientSelector.tsx            # Client dropdown selector
├── admin/
│   ├── page.tsx                      # Admin dashboard
│   ├── analytics/
│   │   └── page.tsx                  # ✅ NEW: Skip analytics dashboard
│   └── components/
│       ├── AdminHeader.tsx           # Admin header with filters
│       ├── StatsCards.tsx            # System-wide stats cards
│       ├── ClientCardsGrid.tsx       # Grid of client cards
│       ├── ClientDetailView.tsx      # Single client detail view
│       ├── ConfigurationSidebar.tsx  # Client configuration editor
│       ├── JobSourceCards.tsx        # Job source status cards
│       ├── RecentFetchesTable.tsx    # Recent API fetch history
│       ├── ActiveBatchesTable.tsx    # Active batches table
│       ├── ApplicationChart.tsx      # Application trends chart
│       ├── LearningLoopAlertsCard.tsx # ✅ NEW: Learning loop alerts
│       └── ManualBatchCreation.tsx   # ✅ NEW: On-demand batch creation
├── search/
│   └── page.tsx                      # ✅ NEW: Job search on-demand (hidden)
└── data/
    ├── dummyJobs.ts                  # Mock data for development
    └── dummyAdminData.ts             # Mock admin data for development
```

---

## 3. CORE PAGES

### 3.1 Main Recruiter View (`/jobs/page.tsx`)

**Route:** `/jobs`
**Access:** Recruiters, Admins
**Purpose:** Review and process job batches

**Key Features:**
- Client selector dropdown (switch between assigned clients)
- Batch performance bar (progress, stats, actions)
- Job card with full details
- Apply/Skip/View actions
- Keyboard shortcuts (A, S, V, arrows)
- Auto-advance to next job after action
- Freshness badges on jobs

**State Management:**
```typescript
const [clients, setClients] = useState<ClientWithBatch[]>([]);
const [selectedClientID, setSelectedClientID] = useState<number | null>(null);
const [currentBatch, setCurrentBatch] = useState<JobBatch | null>(null);
const [batchItems, setBatchItems] = useState<JobBatchItem[]>([]);
const [showApplyModal, setShowApplyModal] = useState(false);
const [showSkipModal, setShowSkipModal] = useState(false);
```

**Custom Hooks Used:**
- `useJobQueue(batchItems)` - Navigation through pending jobs
- `useBatchStats(currentBatch)` - Real-time batch statistics
- `useKeyboardShortcuts({...})` - Keyboard navigation

**Component Hierarchy:**
```
<JobsPage>
  <JobsHeader />
  <BatchPerformanceBar />
  <JobCard />
  <ApplyConfirmationModal />
  <SkipFeedbackModal />
</JobsPage>
```

---

### 3.2 Admin Dashboard (`/jobs/admin/page.tsx`)

**Route:** `/jobs/admin`
**Access:** Admins only
**Purpose:** System-wide monitoring and configuration

**Key Features:**
- System-wide statistics (jobs fetched, applications, success rate)
- Client cards grid (all clients at a glance)
- Client detail view (single client deep dive)
- Configuration sidebar (edit client preferences)
- Learning loop alerts (>50% skip patterns)
- Manual batch creation
- Navigation to analytics dashboard

**State Management:**
```typescript
const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
const [clientCards, setClientCards] = useState<ClientCardData[]>([]);
const [selectedClientID, setSelectedClientID] = useState<number | 'all'>('all');
const [isConfigOpen, setIsConfigOpen] = useState(false);
```

**Component Hierarchy:**
```
<JobsAdminPage>
  <AdminHeader />
  <StatsCards />
  {selectedClientID === 'all' ? (
    <ClientCardsGrid />
  ) : (
    <ClientDetailView />
  )}
  <ConfigurationSidebar />
  <LearningLoopAlertsCard />
  <ManualBatchCreation />
</JobsAdminPage>
```

---

### 3.3 Skip Analytics Dashboard (`/jobs/admin/analytics/page.tsx`)

**Route:** `/jobs/admin/analytics`
**Access:** Admins only
**Purpose:** Analyze skip patterns and identify configuration issues

**Key Features:**
- System-wide skip statistics
- Skip reason breakdown (bar charts)
- Per-client skip rates table
- Learning loop alerts with recommendations
- Client detail modal (skip reason breakdown per client)

**Data Sources:**
- `GET /api/v1/jobs/analytics/skip/system` - System-wide analytics
- `GET /api/v1/jobs/analytics/learning-loop/alerts` - Pattern alerts
- `GET /api/v1/jobs/analytics/skip/client/{clientId}` - Client-specific analytics

**Analytics Displayed:**
- Total actions processed
- Total skips
- Overall skip rate (%)
- Skip reason percentages (Not Relevant, Salary Too Low, etc.)
- Client breakdown with skip rates
- Top 5 learning loop alerts

---

### 3.4 Job Search On-Demand (`/jobs/search/page.tsx`)

**Route:** `/jobs/search`
**Access:** Hidden feature (no navigation link)
**Purpose:** Search job inventory with advanced filters

**Status:** Phase 3 feature, hidden from production UI

**Key Features:**
- Advanced search filters (title, company, location, salary, remote, level, freshness)
- Paginated results (50 per page)
- Job cards with apply/view actions
- Freshness status filtering (Live, Current, Week_Old, Stale)

**Search Filters:**
```typescript
interface JobSearchFilters {
  clientID?: number;
  title?: string;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote?: boolean;
  jobLevel?: string;
  freshnessStatus?: string;
  pageNumber: number;
  pageSize: number;
}
```

---

## 4. COMPONENTS

### 4.1 JobCard (`components/JobCard.tsx`)

**Purpose:** Display full job details with actions

**Props:**
```typescript
interface JobCardProps {
  job: Job;
  onSkip: () => void;
  onView: () => void;
  onApply: () => void;
}
```

**Features:**
- Company logo (with fallback)
- Job title
- Company name
- Location (with remote indicator)
- Salary range (formatted)
- Match score badge (0-100 with stars)
- **NEW:** Freshness badge (Live, Current, Week_Old, Stale, Expired)
- Job description (scrollable)
- Action buttons (Skip, View, Apply)
- Keyboard shortcut hints

**Layout:**
```
┌────────────────────────────────────────┐
│ [Logo] Company Name                    │
│        Job Title                       │
│        Location | Remote | $120k-150k  │
│                                        │
│ [Match Score: 92/100 ⭐⭐⭐⭐⭐]       │
│ [Freshness: 🟢 Live]                   │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ Job Description...                 │ │
│ │ (scrollable)                       │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Skip] [View Posting] [Apply]          │
└────────────────────────────────────────┘
```

---

### 4.2 FreshnessBadge (`components/FreshnessBadge.tsx`)

**Purpose:** Display job freshness status with color-coded badge

**Props:**
```typescript
interface FreshnessBadgeProps {
  status?: 'Live' | 'Current' | 'Week_Old' | 'Stale' | 'Expired' | 'Unknown';
}
```

**Badge Configurations:**

| Status | Age | Color | Icon | Description |
|--------|-----|-------|------|-------------|
| Live | 0-1 days | Green | 🟢 | Brand new job, just posted |
| Current | 1-7 days | Blue | 🔵 | Fresh job, good opportunity |
| Week_Old | 7-14 days | Yellow | 🟡 | Still active but aging |
| Stale | 14-30 days | Orange | 🟠 | Old job, may be filled |
| Expired | 30+ days | Red | 🔴 | Very old, likely filled |
| Unknown | No date | Gray | ⚪ | Posting date unavailable |

**Usage:**
```tsx
<FreshnessBadge status={job.freshnessStatus} />
```

---

### 4.3 LearningLoopAlertsCard (`admin/components/LearningLoopAlertsCard.tsx`)

**Purpose:** Display top 5 learning loop alerts on admin dashboard

**Features:**
- Fetches alerts from API on mount
- Shows client name, skip reason, percentage
- Alert level indicator (Warning, Critical)
- Link to full analytics page
- Empty state for no alerts

**Alert Display:**
```
┌─────────────────────────────────────────┐
│ 🚨 Learning Loop Alerts (3)  [View All] │
├─────────────────────────────────────────┤
│ ┃ Client Name [Critical]        80.5%   │
│ ┃ Skip Reason: Salary Too Low   45/56   │
├─────────────────────────────────────────┤
│ ┃ Client Name [Warning]         65.2%   │
│ ┃ Skip Reason: Not Relevant     32/49   │
└─────────────────────────────────────────┘
```

---

### 4.4 ManualBatchCreation (`admin/components/ManualBatchCreation.tsx`)

**Purpose:** Create job batches on-demand for any client

**Features:**
- Client selector dropdown
- Batch size input (default: 50, range: 10-100)
- Create batch button
- Success/error message display
- Callback on batch created (refresh dashboard)

**API Call:**
```typescript
POST /api/v1/jobs/batches/create
Body: { clientID: number, batchSize: number }
Response: { success: boolean, batchID: number, batchGUID: string, jobsAdded: number, message: string }
```

---

### 4.5 BatchPerformanceBar (`components/BatchPerformanceBar.tsx`)

**Purpose:** Display batch progress and statistics

**Props:**
```typescript
interface BatchPerformanceBarProps {
  stats: BatchStats;
  onComplete: () => void;
  onSaveAndExit: () => void;
}
```

**Stats Displayed:**
- Progress bar (% complete)
- Reviewed jobs count
- Applied jobs count
- Skipped jobs count
- Apply rate (%)
- Time remaining (calculated from expiresTS)
- Average match score

**Actions:**
- Complete Batch button
- Save & Exit button

---

### 4.6 ApplyConfirmationModal & SkipFeedbackModal

**ApplyConfirmationModal:**
- Confirms if user actually applied
- Optional comments field
- Did Apply / Just Viewed buttons

**SkipFeedbackModal:**
- Radio button list of skip reasons
- Custom reason text area (for "Other")
- Confirm Skip button

**Skip Reasons:**
- Already Applied (external/previously)
- Not Relevant to Client's Goals
- Salary Too Low
- Location Doesn't Match
- Requirements Don't Match (missing skills)
- Company on Client's Blacklist
- Job Description Unclear/Incomplete
- Other (requires custom reason)

---

## 5. CUSTOM HOOKS

### 5.1 useJobQueue (`hooks/useJobQueue.ts`)

**Purpose:** Navigate through pending jobs in a batch

**Input:** `batchItems: JobBatchItem[]`

**Returns:**
```typescript
{
  currentJobIndex: number;           // Current position (0-based)
  currentJob: JobBatchItem | null;   // Current job object
  pendingJobs: JobBatchItem[];       // Filtered pending jobs
  totalPendingJobs: number;          // Total pending count
  hasNext: boolean;                  // Can navigate forward
  hasPrevious: boolean;              // Can navigate backward
  goToNext: () => void;              // Navigate to next job
  goToPrevious: () => void;          // Navigate to previous job
}
```

**Logic:**
- Filters batchItems to only show `itemStatus === 'Pending'`
- Tracks current index within pending jobs
- Provides navigation functions
- Auto-updates when batchItems change

---

### 5.2 useBatchStats (`hooks/useBatchStats.ts`)

**Purpose:** Calculate real-time batch statistics

**Input:** `batch: JobBatch | null`

**Returns:**
```typescript
{
  totalJobs: number;                 // Total jobs in batch
  reviewedJobs: number;              // Jobs reviewed (applied + skipped + viewed)
  appliedJobs: number;               // Jobs applied to
  skippedJobs: number;               // Jobs skipped
  viewedJobs: number;                // Jobs viewed but not applied
  progressPercentage: number;        // % complete (0-100)
  avgTimePerJob: number;             // Average seconds per job
  avgMatchScore: number;             // Average match score
  applyRate: number;                 // Apply rate % (applied / reviewed)
  timeRemaining: string;             // "6h 15m" or "Expired"
}
```

**Calculations:**
- `progressPercentage = (reviewedJobs / totalJobs) * 100`
- `applyRate = (appliedJobs / reviewedJobs) * 100`
- `timeRemaining` calculated from `batch.expiresTS`

---

### 5.3 useKeyboardShortcuts (`hooks/useKeyboardShortcuts.ts`)

**Purpose:** Enable keyboard navigation and actions

**Handlers:**
```typescript
{
  onNext: () => void;        // Right arrow → Next job
  onPrevious: () => void;    // Left arrow → Previous job
  onApply: () => void;       // A key → Apply
  onSkip: () => void;        // S key → Skip
  onView: () => void;        // V key → View
}
```

**Features:**
- Ignores key presses in input/textarea elements
- Attaches global keydown listener
- Cleans up listener on unmount
- Conditional handlers (only if hasNext/hasPrevious)

---

## 6. TYPE DEFINITIONS

### 6.1 jobs.ts Types

**Job Interface:**
```typescript
export interface Job {
  jobID: number;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  isRemote: boolean;
  jobLevel?: string;            // 'Entry', 'Mid', 'Senior', 'Lead'
  jobType?: string;             // 'Full-time', 'Part-time', 'Contract'
  postingDate: string;          // ISO date string
  sourceURL: string;
  applicantCount?: number;
  matchScore: number;           // 0-100
  freshnessStatus?: 'Live' | 'Current' | 'Week_Old' | 'Stale' | 'Expired' | 'Unknown'; // ✅ NEW
}
```

**JobBatch Interface:**
```typescript
export interface JobBatch {
  batchID: number;
  batchGUID: string;
  clientID: number;
  clientName: string;
  clientRole: string;
  recruiterID: number;
  totalJobs: number;
  processedJobs: number;
  appliedJobs: number;
  skippedJobs: number;
  viewedJobs: number;
  batchStatus: 'Active' | 'Completed' | 'Expired' | 'Paused';
  createdTS: string;
  expiresTS?: string;
}
```

**JobBatchItem Interface:**
```typescript
export interface JobBatchItem {
  batchItemID: number;
  batchID: number;
  jobID: number;
  job: Job;                     // Nested job object
  itemOrder: number;            // 1-50
  itemStatus: 'Pending' | 'Applied' | 'Skipped' | 'Viewed';
  timeSpentSeconds?: number;
}
```

**Request DTOs:**
```typescript
export interface ApplyJobRequest {
  batchItemID: number;
  clientID: number;
  jobID: number;
  didApply: boolean;            // true = Applied, false = Viewed
  comments?: string;
  timeSpentSeconds?: number;    // ✅ NEW in v2.1: Time tracking
}

export interface SkipJobRequest {
  batchItemID: number;
  clientID: number;
  jobID: number;
  skipReason: SkipReason;
  customReason?: string;
  timeSpentSeconds?: number;    // ✅ NEW in v2.1: Time tracking
}

export type SkipReason =
  | 'Already_Applied'
  | 'Not_Relevant'
  | 'Salary_Too_Low'
  | 'Location_Mismatch'
  | 'Requirements_Mismatch'
  | 'Company_Blacklist'
  | 'Description_Unclear'
  | 'Other';
```

---

### 6.2 admin.ts Types

**AdminStats Interface:**
```typescript
export interface AdminStats {
  totalJobsToday: number;
  totalJobsWeek: number;
  activeBatches: number;
  totalApplicationsToday: number;
  totalApplicationsWeek: number;
  successRate: number;          // % of jobs applied to
  apifyStatus: 'Active' | 'Idle' | 'Error';
}
```

**ClientCardData Interface:**
```typescript
export interface ClientCardData {
  clientID: number;
  clientName: string;
  clientRole: string;
  isConfigured: boolean;
  configurationStatus: string;  // "Configured", "Needs Setup"
  activeBatchID?: number;
  activeBatchGUID?: string;
  batchProgress?: string;        // "32/50"
  batchStatus?: string;
  lastFetchTime?: string;
  jobsFetchedToday: number;
  applicationsToday: number;
}
```

---

## 7. API ACTIONS

**IMPORTANT:** All API calls are centralized in [/actions/jobsActions.ts](app/jobs/actions/jobsActions.ts) using the shared `axiosInstance`.

**Architecture Pattern:**
- Components NEVER make direct axios calls
- All HTTP requests go through the actions layer
- Actions layer uses `axiosInstance` from `/lib/axiosInstance.ts`
- This ensures consistent error handling, authentication, and logging

### 7.1 Recruiter Endpoints

```typescript
// Get all clients with their active batches
getClientsWithBatches(): Promise<ClientWithBatch[]>
→ GET /api/v1/jobs/clients

// Get active batch for a client
getClientBatch(clientId: number): Promise<JobBatch>
→ GET /api/v1/jobs/batches/client/{clientId}

// Get all jobs in a batch
getBatchItems(batchId: number): Promise<JobBatchItem[]>
→ GET /api/v1/jobs/batches/{batchId}/items

// Record apply action
recordApply(request: ApplyJobRequest): Promise<{ success: boolean; message: string }>
→ POST /api/v1/jobs/actions/apply

// Record skip action
recordSkip(request: SkipJobRequest): Promise<{ success: boolean; message: string }>
→ POST /api/v1/jobs/actions/skip

// Update batch status
updateBatchStatus(batchId: number, status: string): Promise<{ success: boolean }>
→ PUT /api/v1/jobs/batches/{batchId}/status
```

---

### 7.2 Admin Endpoints

```typescript
// Get admin dashboard stats
getAdminStats(): Promise<AdminStats>
→ GET /api/v1/jobs/admin/stats

// Get all client cards
getAdminClientCards(): Promise<ClientCardData[]>
→ GET /api/v1/jobs/admin/clients

// Get all active batches
getAdminBatches(): Promise<AdminBatch[]>
→ GET /api/v1/jobs/admin/batches
```

---

### 7.3 Analytics Endpoints

```typescript
// Get client skip analytics
getClientSkipAnalytics(clientId: number): Promise<SkipAnalyticsDto>
→ GET /api/v1/jobs/analytics/skip/client/{clientId}

// Get system-wide skip analytics
getSystemSkipAnalytics(): Promise<SystemSkipAnalyticsDto>
→ GET /api/v1/jobs/analytics/skip/system

// Get learning loop alerts
getLearningLoopAlerts(): Promise<LearningLoopAlertDto[]>
→ GET /api/v1/jobs/analytics/learning-loop/alerts

// Create batch on-demand
createManualBatch(request: { clientID: number; batchSize: number }): Promise<ManualBatchCreationResponseDto>
→ POST /api/v1/jobs/batches/create

// Search jobs on-demand
searchJobs(filters: JobSearchOnDemandRequestDto): Promise<JobSearchOnDemandResponseDto>
→ POST /api/v1/jobs/search
```

---

### 7.4 Configuration Endpoints (✅ NEW in v2.1)

```typescript
// Get client configuration by client ID
getClientConfiguration(clientId: number): Promise<ClientJobConfigurationResponseDto>
→ GET /api/v1/jobs/config/client/{clientId}

// Get configuration by configuration ID
getConfigurationById(configId: number): Promise<ClientJobConfigurationResponseDto>
→ GET /api/v1/jobs/config/{configId}

// Create new client configuration
createClientConfiguration(config: ClientJobConfigurationRequestDto): Promise<ClientJobConfigurationResponseDto>
→ POST /api/v1/jobs/config

// Update existing client configuration
updateClientConfiguration(configId: number, config: ClientJobConfigurationRequestDto): Promise<ClientJobConfigurationResponseDto>
→ PUT /api/v1/jobs/config/{configId}

// Delete client configuration (soft delete)
deleteClientConfiguration(configId: number): Promise<{ success: boolean; message: string }>
→ DELETE /api/v1/jobs/config/{configId}
```

**Configuration Request DTO:**
```typescript
interface ClientJobConfigurationRequestDto {
  clientID: number;
  configurationName?: string;
  jobTitles?: string;                    // Comma-separated
  preferredLocations?: string;           // Comma-separated
  keywords?: string;                     // Comma-separated
  excludeKeywords?: string;              // Comma-separated
  salaryMin?: number;
  salaryMax?: number;
  remotePreference: boolean;             // true = Remote only
  jobLevelPreference?: string;           // "Entry", "Mid", "Senior"
  excludedCompanies?: string;            // JSON array
  preferredCompanies?: string;           // JSON array
  minMatchScore?: number;                // 0-100
  exclusionRules?: string;               // JSON advanced rules
  autoApplyEnabled: boolean;
  industryPreferences?: string;          // JSON array
  enableLinkedInSource?: boolean;
  jobSourceQueryTemplate?: string;       // JSON template
  primaryJobSourceID?: number;
  isActive: boolean;
  isPrimary: boolean;
}
```

**Configuration Response DTO:**
```typescript
interface ClientJobConfigurationResponseDto {
  configurationID: number;
  clientID: number;
  clientName?: string;
  configurationName?: string;
  // ... all fields from request DTO
  primaryJobSourceName?: string;
  createdTS: string;                     // ISO date string
  updatedTS: string;                     // ISO date string
  createdBy?: string;
  updatedBy?: string;
}
```

---

## 8. DATA FLOW

### 8.1 Job Review Flow (Recruiter)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LOAD CLIENTS                                                  │
│    Frontend calls: getClientsWithBatches()                       │
│    → GET /api/v1/jobs/clients                                    │
│    → Returns: [{ clientID, clientName, activeBatchID, ... }]    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. SELECT CLIENT                                                 │
│    User selects "John Doe" (ClientID = 5)                       │
│    Frontend calls:                                               │
│    - getClientBatch(5)                                           │
│      → GET /api/v1/jobs/batches/client/5                         │
│    - getBatchItems(batchID)                                      │
│      → GET /api/v1/jobs/batches/{batchID}/items                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. FILTER PENDING JOBS                                           │
│    useJobQueue filters items where itemStatus === 'Pending'     │
│    Displays first pending job with JobCard component            │
│    FreshnessBadge shows job age (Live, Current, etc.)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. USER CLICKS "APPLY"                                           │
│    - Opens job URL in new tab                                   │
│    - Shows ApplyConfirmationModal after 500ms                   │
│    - User confirms: "Did you actually apply?"                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. RECORD APPLY ACTION                                           │
│    Frontend calls: recordApply({...})                            │
│    → POST /api/v1/jobs/actions/apply                             │
│    Backend updates:                                              │
│    - JobBatchItems.ItemStatus = 'Applied'                       │
│    - JobBatches.ProcessedJobs++, AppliedJobs++                  │
│    - JobApplicationActions (audit trail)                        │
│    - JobClientState.Status = 'Applied'                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. UPDATE LOCAL STATE                                            │
│    - setBatchItems (mark item as 'Applied')                     │
│    - setCurrentBatch (increment processedJobs, appliedJobs)     │
│    - Show toast: "Application tracked for {company}"            │
│    - Auto-advance to next job (goToNext())                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8.2 Skip Analytics Flow (Admin)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. LOAD ANALYTICS PAGE                                           │
│    Route: /jobs/admin/analytics                                  │
│    Parallel API calls:                                           │
│    - getSystemSkipAnalytics()                                    │
│      → GET /api/v1/jobs/analytics/skip/system                    │
│    - getLearningLoopAlerts()                                     │
│      → GET /api/v1/jobs/analytics/learning-loop/alerts           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. DISPLAY SYSTEM ANALYTICS                                      │
│    - Total actions, total skips, overall skip rate              │
│    - Skip reason breakdown (bar charts)                          │
│    - Per-client skip rates table                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. DISPLAY LEARNING LOOP ALERTS                                  │
│    Alerts where skipPercentage > 50%:                            │
│    - Client name                                                 │
│    - Skip reason (Salary_Too_Low, Not_Relevant, etc.)           │
│    - Skip percentage                                             │
│    - Alert level (Warning, Critical)                            │
│    - Recommendation ("Increase MinSalary to $120k")             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. ADMIN CLICKS "VIEW DETAILS" FOR CLIENT                        │
│    Frontend calls: getClientSkipAnalytics(clientId)              │
│    → GET /api/v1/jobs/analytics/skip/client/{clientId}           │
│    Modal shows:                                                  │
│    - Client-specific skip stats                                 │
│    - Skip reason breakdown                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. ADMIN REVIEWS ALERTS & UPDATES CONFIGURATION                  │
│    Manual process:                                               │
│    - Review recommendations                                      │
│    - Update ClientJobConfiguration (via Configuration Sidebar)  │
│    - Adjust MinSalary, Keywords, Locations, etc.                │
│    - System continues monitoring for new patterns               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. STATE MANAGEMENT

### 9.1 Component-Level State

**Jobs Page (`/jobs/page.tsx`):**
- `clients` - List of assigned clients with batch status
- `selectedClientID` - Currently selected client
- `currentBatch` - Active batch details
- `batchItems` - All jobs in current batch
- `showApplyModal` / `showSkipModal` - Modal visibility

**Admin Page (`/jobs/admin/page.tsx`):**
- `adminStats` - System-wide statistics
- `clientCards` - All client cards data
- `selectedClientID` - Filter by client ('all' or specific ID)
- `isConfigOpen` - Configuration sidebar visibility

---

### 9.2 Global State (AuthContext)

**Used for:**
- User roles (from Azure AD)
- Employee ID (for assigning actions)
- Authentication token (for API calls)

**Accessed via:**
```typescript
const { roles, employeeID } = useAuth();
const userRole = mapAzureRoleToAppRole(roles);
```

---

## 10. NEW FEATURES (PHASE 1-3)

### 10.1 Job Freshness Tracking

**Implementation:**
- `FreshnessBadge` component shows color-coded job age
- 6 categories: Live (🟢), Current (🔵), Week_Old (🟡), Stale (🟠), Expired (🔴), Unknown (⚪)
- Updated daily by backend Hangfire job (8 AM)
- Helps recruiters prioritize fresh jobs

**Usage in JobCard:**
```tsx
{job.freshnessStatus && (
  <FreshnessBadge status={job.freshnessStatus} />
)}
```

---

### 10.2 Skip Analytics Dashboard

**Location:** `/jobs/admin/analytics`

**Purpose:** Data-driven configuration improvements

**Features:**
- System-wide skip statistics
- Skip reason breakdown with percentages
- Per-client skip rates table
- Learning loop alerts (>50% threshold)
- Client detail modal with skip breakdown

**Key Insights:**
- Identify clients with high skip rates
- Detect patterns (e.g., 80% "Salary Too Low")
- Recommendations for configuration adjustments
- Conservative approach (flags for human review)

---

### 10.3 Manual Batch Creation

**Component:** `ManualBatchCreation`

**Features:**
- Client selector dropdown
- Batch size input (default: 50)
- Create batch on-demand (no waiting for scheduled job)
- Success/error feedback
- Refresh dashboard after creation

**Use Cases:**
- Client needs urgent batch
- Testing new configurations
- Backfilling batches for new clients

---

### 10.4 Learning Loop Alerts Card

**Component:** `LearningLoopAlertsCard`

**Displays:**
- Top 5 alerts (sorted by skip percentage)
- Client name, skip reason, percentage
- Alert level (Warning >50%, Critical >70%)
- Link to full analytics page

**Location:** Admin dashboard homepage

---

## 11. LATEST UPDATES (v2.1)

### 11.1 Time Tracking Implementation ✅

**Date Implemented:** October 24, 2025

**Purpose:** Track recruiter time spent on each job for productivity analytics

**Changes Made:**

**Type Updates** ([types/jobs.ts](app/jobs/types/jobs.ts)):
```typescript
export interface ApplyJobRequest {
  batchItemID: number;
  clientID: number;
  jobID: number;
  didApply: boolean;
  comments?: string;
  timeSpentSeconds?: number;  // ✅ NEW
}

export interface SkipJobRequest {
  batchItemID: number;
  clientID: number;
  jobID: number;
  skipReason: SkipReason;
  customReason?: string;
  timeSpentSeconds?: number;  // ✅ NEW
}
```

**Implementation** ([page.tsx](app/jobs/page.tsx:73-80)):
```typescript
// Track time spent on each job
const [jobStartTime, setJobStartTime] = useState<number>(Date.now());

// Reset timer when job changes
useEffect(() => {
  if (currentJob) {
    setJobStartTime(Date.now());
  }
}, [currentJob?.batchItemID]);

// Calculate time when applying
const handleApplyConfirm = async (didApply: boolean, comments: string) => {
  const timeSpentSeconds = Math.floor((Date.now() - jobStartTime) / 1000);

  await recordApply({
    batchItemID: currentJob.batchItemID,
    clientID: currentBatch.clientID,
    jobID: currentJob.jobID,
    didApply,
    comments,
    timeSpentSeconds,  // ✅ Sent to backend
  });
};

// Same for skip action
const handleSkipConfirm = async (skipReason: SkipReason, customReason: string) => {
  const timeSpentSeconds = Math.floor((Date.now() - jobStartTime) / 1000);

  await recordSkip({
    batchItemID: currentJob.batchItemID,
    clientID: currentBatch.clientID,
    jobID: currentJob.jobID,
    skipReason,
    customReason,
    timeSpentSeconds,  // ✅ Sent to backend
  });
};
```

**Backend Integration:**
- Backend already accepts `timeSpentSeconds` field in both endpoints
- Stored in `JobBatchItems.TimeSpentSeconds` and `JobApplicationActions.TimeSpentSeconds`
- Available for future analytics dashboards

**Benefits:**
- Track recruiter efficiency
- Identify complex jobs (long review times)
- Calculate average time per job
- Future feature: Productivity analytics dashboard

---

### 11.2 Client Configuration Management ✅

**Date Implemented:** October 24, 2025

**Purpose:** Full CRUD operations for client job configurations from the admin UI

**Backend Endpoints Created** ([JobsApiController.cs](Controllers/JobsApiController.cs:746-1138)):

```csharp
// Get configuration by client ID
GET /api/v1/jobs/config/client/{clientId}
→ Returns: ClientJobConfigurationResponseDto

// Get configuration by config ID
GET /api/v1/jobs/config/{configId}
→ Returns: ClientJobConfigurationResponseDto

// Create new configuration
POST /api/v1/jobs/config
→ Body: ClientJobConfigurationRequestDto
→ Returns: ClientJobConfigurationResponseDto (201 Created)

// Update existing configuration
PUT /api/v1/jobs/config/{configId}
→ Body: ClientJobConfigurationRequestDto
→ Returns: ClientJobConfigurationResponseDto

// Delete configuration (soft delete)
DELETE /api/v1/jobs/config/{configId}
→ Returns: { success: true, message: "..." }
```

**Frontend Actions** ([jobsActions.ts](app/jobs/actions/jobsActions.ts:352-468)):
```typescript
// Get client configuration
getClientConfiguration(clientId: number): Promise<ClientJobConfigurationResponseDto>

// Get configuration by ID
getConfigurationById(configId: number): Promise<ClientJobConfigurationResponseDto>

// Create new configuration
createClientConfiguration(config: ClientJobConfigurationRequestDto): Promise<ClientJobConfigurationResponseDto>

// Update configuration
updateClientConfiguration(configId: number, config: ClientJobConfigurationRequestDto): Promise<ClientJobConfigurationResponseDto>

// Delete configuration
deleteClientConfiguration(configId: number): Promise<{ success: boolean, message: string }>
```

**ConfigurationSidebar Updates** ([admin/components/ConfigurationSidebar.tsx](app/jobs/admin/components/ConfigurationSidebar.tsx)):

**Before (v2.0):**
- Used dummy data from `dummyAdminData.ts`
- Save button just logged to console
- No API integration

**After (v2.1):**
```typescript
// Load configuration on open
useEffect(() => {
  const loadConfiguration = async () => {
    if (clientID && isOpen) {
      try {
        const data = await getClientConfiguration(clientID);
        setConfig(mapBackendToFrontend(data));
      } catch (error) {
        if (error.message.includes('No configuration found')) {
          // Initialize with defaults for new configuration
          setConfig(createDefaultConfig(clientID));
        }
      }
    }
  };
  loadConfiguration();
}, [clientID, isOpen]);

// Save configuration
const handleSave = async () => {
  const requestData = mapFrontendToBackend(config);

  if (config.configID && config.configID > 0) {
    // Update existing
    await updateClientConfiguration(config.configID, requestData);
    toast.success('Configuration updated successfully');
  } else {
    // Create new
    await createClientConfiguration(requestData);
    toast.success('Configuration created successfully');
  }

  onSave(config);
  onClose();
};
```

**Features:**
- ✅ Load real configuration from backend
- ✅ Create new configuration if none exists
- ✅ Update existing configuration
- ✅ Loading states (spinner while fetching)
- ✅ Saving states (disabled buttons during save)
- ✅ Toast notifications (success/error)
- ✅ Proper error handling
- ✅ Data mapping between frontend and backend types

**Configuration Fields:**
- Job search criteria (keywords, locations, salary range)
- Job types (Full-time, Part-time, Contract)
- Experience level (Entry, Mid, Senior)
- Remote preference (Remote, Hybrid, On-site, Any)
- Job sources (Apify enabled/disabled)
- Fetching settings (frequency, jobs per fetch, auto-create batches)
- Batch settings (batch size, match score threshold, expiry hours)

---

### 11.3 Client Detail View Integration ✅

**Date Implemented:** October 24, 2025

**Purpose:** Display real client configuration data in admin detail view

**Admin Page Updates** ([admin/page.tsx](app/jobs/admin/page.tsx:52-104)):

**Before (v2.0):**
```typescript
// Always returned null
const selectedClientConfig = selectedClientID !== 'all'
  ? null // Will be fetched from API later
  : null;
```

**After (v2.1):**
```typescript
// State for configuration
const [selectedClientConfig, setSelectedClientConfig] = useState<ClientConfiguration | null>(null);
const [loadingConfig, setLoadingConfig] = useState(false);

// Load configuration when client is selected
useEffect(() => {
  const loadClientConfig = async () => {
    if (selectedClientID !== 'all') {
      try {
        setLoadingConfig(true);
        const data = await getClientConfiguration(selectedClientID);
        setSelectedClientConfig(mapBackendToFrontend(data));
      } catch (error) {
        if (error.message.includes('No configuration found')) {
          setSelectedClientConfig(null); // Show as not configured
        } else {
          toast.error('Failed to load client configuration');
        }
      } finally {
        setLoadingConfig(false);
      }
    } else {
      setSelectedClientConfig(null);
    }
  };

  loadClientConfig();
}, [selectedClientID]);
```

**Client Detail View** ([admin/components/ClientDetailView.tsx](app/jobs/admin/components/ClientDetailView.tsx)):

**Before (v2.0):**
- Always showed "Client configuration not found" (config was always null)

**After (v2.1):**
- Shows real configuration summary card
- Displays job sources, recent fetches, active batches
- Application chart with real data
- "Edit Configuration" button opens sidebar with real data

**Impact:**
- ✅ Admins can now view client configurations
- ✅ One-click edit from detail view
- ✅ See which clients are configured vs. need setup
- ✅ View configuration history (created/updated timestamps)

---

### 11.4 Architecture Improvements

**Actions Layer Pattern Enforcement:**

All API calls MUST go through the actions layer. Components never make direct axios calls.

**Pattern:**
```
Component → Action Function → axiosInstance → Backend API
```

**Example:**
```typescript
// ❌ WRONG: Direct axios call in component
import axios from 'axios';
const response = await axios.get('/api/v1/jobs/config/client/5');

// ✅ CORRECT: Use action function
import { getClientConfiguration } from '../../actions/jobsActions';
const config = await getClientConfiguration(5);
```

**Benefits:**
- Consistent error handling
- Centralized logging
- Easier testing
- Authentication handled automatically
- TypeScript type safety

---

### 11.5 Type Safety Improvements

**Fixed Type Issues:**
- Changed `null` to `undefined` for optional fields in `ClientConfiguration`
- Added proper null checks for `configID` before comparisons
- Ensured all API responses are properly typed

**Before:**
```typescript
assignedRecruiterID: null,  // ❌ Type error: Type 'null' is not assignable to type 'number | undefined'
```

**After:**
```typescript
assignedRecruiterID: undefined,  // ✅ Correct
```

---

### 11.6 Build Status

**Frontend Build:** ✅ Successful (Zero TypeScript errors)

```bash
npm run build
✓ Compiled successfully
✓ Generating static pages (22/22)
```

**All Pages Built:**
- `/jobs` - Main recruiter view
- `/jobs/admin` - Admin dashboard
- `/jobs/admin/analytics` - Skip analytics
- `/jobs/search` - Job search (hidden)

---

## 12. HIDDEN FEATURES

### 12.1 Job Search On-Demand

**Route:** `/jobs/search`
**Status:** Hidden from navigation (no link in header/sidebar)
**Access:** Direct URL only (or via future navigation link)

**Purpose:** Allow admins/recruiters to search job inventory with advanced filters

**Features:**
- Full-text search (title, company, location)
- Salary range filters
- Remote-only checkbox
- Job level filtering
- Freshness status filtering (Live, Current, Week_Old, Stale)
- Paginated results (50 per page)
- Job cards with apply/view actions

**To Enable in Production:**
1. Add navigation link in `AdminHeader` or `JobsHeader`
2. Test with real data
3. Monitor usage and performance
4. Consider adding to recruiter role

**Why Hidden:**
- Phase 3 feature not yet tested with real data
- Needs performance monitoring
- UI/UX needs refinement
- Waiting for user feedback

---

## 13. STYLING & THEME

### 13.1 Color Palette

**Primary Colors:**
- Primary Purple: `#682A53` (CareerVest brand color)
- Purple Gradient: `from-[#682A53] to-purple-600`
- Background: `bg-gray-50`, `bg-white`

**Status Colors:**
- Green: `bg-green-100`, `text-green-700` (Live, Success)
- Blue: `bg-blue-100`, `text-blue-700` (Current)
- Yellow: `bg-yellow-100`, `text-yellow-700` (Week_Old, Warning)
- Orange: `bg-orange-100`, `text-orange-700` (Stale)
- Red: `bg-red-100`, `text-red-700` (Expired, Critical)

---

### 13.2 Component Styling Patterns

**Cards:**
```css
className="bg-white rounded-xl shadow-lg p-6 border border-purple-200"
```

**Buttons:**
```css
className="bg-gradient-to-r from-[#682A53] to-purple-600 hover:from-purple-600 hover:to-[#682A53] text-white font-semibold py-3 px-6 rounded-lg transition-all"
```

**Badges:**
```css
className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border bg-green-100 text-green-700 border-green-300"
```

---

### 13.3 Responsive Design

**Breakpoints:**
- Mobile: Default (< 640px)
- Tablet: `md:` (>= 768px)
- Desktop: `lg:` (>= 1024px)
- Large Desktop: `xl:` (>= 1280px)

**Grid Layouts:**
- Stats cards: `grid-cols-1 md:grid-cols-3`
- Client cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Search filters: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## APPENDIX A: KEYBOARD SHORTCUTS

| Key | Action | Description |
|-----|--------|-------------|
| `A` | Apply | Open apply modal for current job |
| `S` | Skip | Open skip modal for current job |
| `V` | View | Open job posting in new tab |
| `→` | Next | Navigate to next pending job |
| `←` | Previous | Navigate to previous pending job |

**Notes:**
- Shortcuts disabled when typing in input/textarea
- Only work when focused on JobCard
- Conditional (only if hasNext/hasPrevious)

---

## APPENDIX B: TOAST NOTIFICATIONS

**Library:** Sonner (react-hot-toast alternative)

**Usage:**
```typescript
import { toast } from 'sonner';

// Success toast
toast.success('Application tracked!', {
  description: 'Applied to Google - Software Engineer'
});

// Error toast
toast.error('Failed to record action');

// Info toast
toast.info('Switched to John Doe');
```

**Positions:** Bottom-center (default)

---

## APPENDIX C: DEVELOPMENT NOTES

### Running Locally

```bash
cd /Users/development/CareerVestFrontEnd3.0
npm install
npm run dev
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_AZURE_CLIENT_ID` - Azure AD client ID
- `NEXT_PUBLIC_AZURE_TENANT_ID` - Azure AD tenant ID

### Mock Data

**Development Mode:**
- Use `dummyJobs.ts` and `dummyAdminData.ts` for offline development
- Switch to real API calls by uncommenting axios calls

### Testing Checklist

- [ ] Job review flow (apply, skip, view)
- [ ] Keyboard shortcuts (A, S, V, arrows)
- [ ] Batch completion workflow
- [ ] Client switching
- [ ] Freshness badges display correctly
- [ ] Skip analytics dashboard loads
- [ ] Learning loop alerts display
- [ ] Manual batch creation works
- [ ] Job search on-demand (/jobs/search)

---

**END OF DOCUMENTATION**
