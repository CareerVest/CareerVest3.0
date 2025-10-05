# CareerVest Pipeline Workflow Documentation

## Table of Contents
1. [Pipeline Stages Overview](#1-pipeline-stages-overview)
2. [Client Enrollment & Initial State](#2-client-enrollment--initial-state)
3. [Stage-by-Stage Journey](#3-stage-by-stage-journey)
4. [Stage Transition Rules](#4-stage-transition-rules)
5. [Role-Based Access Control](#5-role-based-access-control)
6. [Document Requirements](#6-document-requirements)
7. [Special States & Conditions](#7-special-states--conditions)
8. [SLA & Timing Rules](#8-sla--timing-rules)
9. [Notifications & Alerts](#9-notifications--alerts)
10. [Business Rules & Validations](#10-business-rules--validations)

---

## 1. Pipeline Stages Overview

The CareerVest pipeline consists of **4 main stages** and **3 special states**:

### Main Pipeline Stages (Sequential Flow):
1. **Sales** - Initial client enrollment and qualification
2. **Resume** - Resume preparation and documentation
3. **Marketing** - Job search and placement activities
4. **ReMarketing** - Re-engagement for clients who need renewed placement efforts

### Special States (Terminal/Conditional):
5. **Placed** - Successfully placed in a job (success state)
6. **Backed-Out** - Client withdrew or was disqualified (exit state)
7. **On-Hold** - Temporarily paused for various reasons (suspension state)

---

## 2. Client Enrollment & Initial State

### How Clients Enter the System:
- Clients are created by **Sales Executives**
- Initial state is automatically set to **"Sales"**
- EnrollmentDate is recorded as the creation timestamp
- Clients can be assigned a Sales Person (optional at creation)

### Initial Information Captured:
- Client name, contact information (email, phone)
- Tech stack/skills
- Visa status
- LinkedIn URL
- Subscription plan details
- Priority level (set during Sales stage)

---

## 3. Stage-by-Stage Journey

### STAGE 1: SALES

**Purpose:** Qualify candidates, assess priority, and gather initial documentation

**Who Manages:** Sales Executives

**Required Actions (in sequence):**
1. **RateCandidate** - Set priority level (exceptional/real-time/fresher/standard)
2. **Upload Required Docs - Sales** - Upload resume checklist and initial resume

**Exit Criteria:**
- Priority must be set
- Required documents uploaded (Resume Checklist + Resume)
- Minimum 2 documents required

**Transition Options:**
- **Forward:** Move to Resume (normal flow)
- **Lateral:** Move to Backed-Out, On-Hold
- **Direct to Placed:** Possible in exceptional cases

**SLA Timing:** 1 business day to complete

---

### STAGE 2: RESUME

**Purpose:** Create professional resume and prepare marketing materials

**Who Manages:** Resume Writers

**Required Actions (in sequence):**
1. **Acknowledged** - Confirm receipt of assignment (min 10 chars comment)
2. **Initial Call Done** - Complete discovery call with client (min 20 chars comment)
3. **Resume Completed** - Upload draft resume (1 PDF/DOC/DOCX file required)
4. **Upload Required Docs - Resume** - Upload final resume, cover letter, and checklist

**Prerequisites:**
- Each action depends on previous completion
- Upload Required Docs needs all 3 prior actions completed

**Exit Criteria:**
- All 4 actions completed
- Final documents uploaded (Resume + Cover Letter + Checklist = 3 required files)

**Transition Options:**
- **Forward:** Move to Marketing (normal flow)
- **Lateral:** Move to Backed-Out, On-Hold
- **Direct to Placed:** Possible in exceptional cases

**SLA Timing:** 2 business days to complete

---

### STAGE 3: MARKETING

**Purpose:** Execute job search strategy and secure placement

**Who Manages:** Marketing Manager, Senior Recruiters, Recruiters (hierarchical)

**Required Actions (by role):**

**Marketing Manager:**
1. **Acknowledged-Marketing** - Confirm client receipt for marketing
2. **AssignRecruiter** - Assign a recruiter to the client

**Senior Recruiter:**
- Can acknowledge after Marketing Manager
- Can view and work with assigned clients
- Limited to clients assigned to them

**Recruiter:**
- Can acknowledge after Senior Recruiter
- Can view assigned clients
- Performs daily job application activities

**Key Business Rules:**
- Marketing Manager must acknowledge before recruiter assignment
- Recruiters can only be changed by Marketing Manager
- Recruiter assignment is required for tracking and accountability

**Exit Criteria:**
- Client successfully placed in a job OR
- Client needs remarketing efforts

**Transition Options:**
- **Forward:** Move to Placed (success)
- **Lateral:** Move to ReMarketing, Backed-Out, On-Hold

**SLA Timing:** 180 business days (6 months)

---

### STAGE 4: REMARKETING

**Purpose:** Renewed placement efforts for clients who need additional support

**Who Manages:** Marketing Manager, Recruiters

**Required Actions:**
1. **Acknowledged-Remarketing** - Confirm remarketing assignment
2. **AssignRecruiter** - Assign or reassign recruiter

**Entry Points:**
- From Placed (job didn't work out)
- From Marketing (strategy change needed)
- From Backed-Out (client re-engaged)
- From On-Hold (resuming activities)

**Exit Criteria:**
- Client placed successfully
- Client backs out permanently

**Transition Options:**
- **Forward:** Move to Placed
- **Lateral:** Move to Backed-Out, On-Hold

**SLA Timing:** 2 business days to acknowledge and assign

---

## 4. Stage Transition Rules

### Automatic Transitions (Action-Triggered):
- **Sales → Resume:** Triggered by "Upload Required Docs - Sales"
- **Resume → Marketing:** Triggered by "Upload Required Docs - Resume"

### Manual Transitions (Require Comments):
All manual transitions require:
- Minimum 10-15 character explanation
- User confirmation
- Appropriate role permissions

### Transition Document Requirements:

| From Stage | To Stage | Required Documents | Optional Documents |
|------------|----------|-------------------|-------------------|
| Sales | Resume | Resume Checklist, Resume | Additional docs |
| Resume | Marketing | Final Resume, Cover Letter, Checklist | Additional docs |
| Marketing | Placed | Placement Confirmation, Offer Letter | Contract Details |
| ReMarketing | Placed | Offer Letter | Placement Confirmation |
| Any | Backed-Out | None | Backout Reason, Communication Log |

### Stage Transition Validation:
- Prerequisites must be completed
- User must have appropriate role
- Required documents must be uploaded
- Comment/reason must meet minimum length
- Client state must be valid for transition

---

## 5. Role-Based Access Control

### Admin
- **Access:** ALL stages and actions
- **Permissions:** Full control, can override any restriction
- **Special Powers:** Can move clients between any stages

### Sales Executive
- **Access:** Sales stage only
- **Actions:**
  - Rate Candidate (set priority)
  - Upload Required Docs - Sales
  - Move to Resume, Backed-Out, On-Hold, Placed
- **Restrictions:** Cannot access Resume, Marketing stages

### Resume Writer
- **Access:** Resume stage only
- **Actions:**
  - Acknowledge assignment
  - Complete Initial Call
  - Complete Resume (upload draft)
  - Upload Required Docs - Resume
  - Move to Marketing, Backed-Out, On-Hold, Placed
- **Restrictions:** Cannot access Sales, Marketing stages

### Marketing Manager
- **Access:** Marketing and ReMarketing stages
- **Actions:**
  - Acknowledge assignments (first in hierarchy)
  - Assign/Change Recruiters
  - Move to Placed, Backed-Out, On-Hold, ReMarketing
  - View all marketing clients
- **Restrictions:** Cannot access Sales, Resume stages (view only)

### Senior Recruiter
- **Access:** Marketing and ReMarketing stages
- **Actions:**
  - Acknowledge after Marketing Manager
  - View assigned clients
  - Limited management actions
- **Restrictions:**
  - Must wait for Marketing Manager acknowledgment
  - Cannot assign/change recruiters
  - Can only act on assigned clients

### Recruiter
- **Access:** Marketing and ReMarketing stages
- **Actions:**
  - Acknowledge after Senior Recruiter
  - Work on assigned clients
  - Daily job application activities
- **Restrictions:**
  - Must wait for Senior Recruiter acknowledgment
  - Cannot assign/change recruiters
  - Lowest privilege in marketing hierarchy

### Action Hierarchy in Marketing:
```
Marketing Manager (Acknowledges first)
    ↓
Senior Recruiter (Acknowledges second)
    ↓
Recruiter (Acknowledges last)
```

---

## 6. Document Requirements

### Sales Stage Documents:
- **Resume Checklist** (Required, PDF/DOC/DOCX, max 10MB)
- **Resume** (Required, PDF/DOC/DOCX, max 10MB)
- **Additional Documents** (Optional, PDF/DOC/DOCX/JPG/PNG, max 20MB)

### Resume Stage Documents:
- **Draft Resume** (Required for "Resume Completed", PDF/DOC/DOCX, max 10MB, exactly 1 file)
- **Final Resume** (Required for transition, PDF/DOC/DOCX, max 15MB)
- **Cover Letter** (Required for transition, PDF/DOC/DOCX, max 15MB)
- **Resume Checklist** (Required for transition, PDF/DOC/DOCX, max 15MB)

### Marketing/ReMarketing Stage Documents:
- **Placement Confirmation** (Required for Placed transition, PDF/DOC/DOCX, max 10MB)
- **Offer Letter** (Required for Placed transition, PDF/DOC/DOCX, max 10MB)
- **Contract Details** (Optional, PDF/DOC/DOCX, max 15MB)

### Document Storage:
- All documents uploaded to SharePoint
- Linked to specific pipeline stage and action
- Tracked with upload timestamp and uploader
- Associated with client record permanently

---

## 7. Special States & Conditions

### PLACED (Success State)

**Entry Points:**
- From Marketing (normal completion)
- From ReMarketing (successful re-placement)
- From any stage in exceptional cases (Admin override)

**Meaning:** Client successfully secured employment

**Exit Options:**
- **To ReMarketing:** Job didn't work out, needs new placement
- **To Sales/Resume/Marketing:** Restart pipeline (rare, Admin only)
- **To On-Hold:** Temporary hold on placed status

**Who Can Transition In:**
- Marketing Manager
- Senior Recruiter (from Marketing)
- Admin (from anywhere)

---

### BACKED-OUT (Exit State)

**Entry Points:** From any main stage

**Meaning:** Client withdrew, disqualified, or service terminated

**Common Reasons:**
- Client found job independently
- Client not responsive
- Client doesn't meet qualification criteria
- Client requested termination

**Exit Options:**
- **To ReMarketing:** Client wants to re-engage
- **To Sales/Resume/Marketing:** Restart from specific stage (Admin)
- **To On-Hold:** Pause before decision

**Document Requirements:** Optional backout reason documentation

**Who Can Transition In:**
- Stage-specific roles (Sales Exec from Sales, Resume Writer from Resume, etc.)
- Marketing Manager from Marketing
- Admin from anywhere

---

### ON-HOLD (Suspension State)

**Entry Points:** From any stage

**Meaning:** Temporary pause in services

**Common Reasons:**
- Client requested pause
- Payment issues
- Client personal circumstances
- Awaiting documentation
- Seasonal pause

**Exit Options:**
- **To ReMarketing:** Resume with new strategy
- **To Sales/Resume/Marketing:** Resume at specific stage
- **To Placed:** Hold resolved, client secured job

**Business Rules:**
- SLA timers pause while on hold
- Client marked as "inactive" for job applications
- Can be held indefinitely
- Requires comment explaining hold reason

**Who Can Transition In:**
- Marketing Manager (most common)
- Stage-specific roles from their stages
- Admin from anywhere

---

## 8. SLA & Timing Rules

### Stage SLA Configuration:

| Stage | Max Days | Warning Threshold | Description |
|-------|----------|------------------|-------------|
| **Sales** | 1 business day | 0.5 days (12 hours) | Quick qualification and handoff |
| **Resume** | 2 business days | 1 day | Rapid resume creation |
| **Marketing** | 180 days (6 months) | 30 days remaining | Extended placement period |
| **ReMarketing** | 2 business days | 1 day | Quick re-assignment |

### SLA Status Indicators:

**On-Track (Green):**
- Client progressing within SLA timeline
- No immediate action needed
- Standard monitoring

**Warning (Yellow):**
- Approaching SLA deadline
- Triggered at warning threshold
- Increased attention needed
- Example: Sales at 12 hours, Resume at 1 day remaining

**Overdue (Red):**
- Exceeded SLA deadline
- Immediate escalation required
- Management intervention needed
- Alerts sent to supervisors

**Completed (Gray):**
- Client moved to next stage
- SLA no longer applies
- Historical record maintained

### SLA Exclusions:
- **Placed, Backed-Out, On-Hold:** No SLA tracking (terminal/special states)
- **Weekends and holidays:** Excluded from business day calculations
- **Client-requested delays:** Can pause SLA (requires documentation)

### SLA Calculation:
- Uses business days only (Monday-Friday)
- Starts when client enters stage
- Ends when client moves to next stage
- Automatically calculated based on current date
- Displayed as: days remaining, days overdue, percentage complete

---

## 9. Notifications & Alerts

### Notification Triggers:

**Action-Based Notifications:**
- **Action Completed:** Sent to next person in workflow
- **Stage Transition:** Sent to new stage owner and client (email)
- **Assignment:** Sent to newly assigned recruiter
- **Recruiter Change:** Sent to both old and new recruiter

**SLA-Based Notifications:**
- **Warning Alert:** When warning threshold reached
- **Overdue Alert:** When SLA exceeded
- **Daily Digest:** Overdue items summary to managers

**State Change Notifications:**
- **Placed:** Congratulations to client and team
- **Backed-Out:** Exit confirmation
- **On-Hold:** Hold confirmation to client

### Notification Channels:

**Email (Microsoft Graph API):**
- Professional email via Microsoft 365
- Threaded conversations (linked to pipeline stage)
- Attachments supported
- Email templates for each action type
- Tracked in Notifications table

**Teams Notifications:**
- Real-time alerts to assigned staff
- Channel notifications for team awareness
- @mentions for urgent items

**In-App Notifications:**
- Dashboard badges for pending actions
- Action required indicators
- Real-time updates

### Notification Recipients:

| Event | Primary Recipient | CC Recipients | Notification Type |
|-------|------------------|---------------|-------------------|
| Sales → Resume | Resume Writer | Sales Exec | Email + Teams |
| Resume → Marketing | Marketing Manager | Resume Writer | Email + Teams |
| Recruiter Assigned | Assigned Recruiter | Marketing Manager | Email + Teams |
| SLA Warning | Stage Owner | Supervisor | Email + Dashboard |
| SLA Overdue | Supervisor | Department Head | Email + Teams (urgent) |
| Placed | Client | All assigned staff | Email (celebration) |

### Email Threading:
- Each pipeline stage gets unique email thread
- Replies automatically linked to pipeline stage
- Conversation history maintained
- Thread depth tracked
- Parent-child relationships preserved

---

## 10. Business Rules & Validations

### Priority Management:
- **Exceptional:** VIP clients, urgent placements, highest priority
- **Real-Time:** Active job seekers needing immediate attention
- **Fresher:** Entry-level candidates, standard timeline
- **Standard:** Regular clients, normal processing

**Priority Rules:**
- Must be set in Sales stage (mandatory via RateCandidate action)
- Cannot proceed to Resume without priority
- Affects job application frequency and attention level
- Visible across all stages

---

### Action Prerequisite Chain:

**Sales Stage:**
```
RateCandidate (required first)
    ↓
Upload Required Docs - Sales
```

**Resume Stage:**
```
Acknowledged
    ↓
Initial Call Done
    ↓
Resume Completed
    ↓
Upload Required Docs - Resume
```

**Marketing Stage:**
```
Acknowledged-Marketing
    ↓
AssignRecruiter (required for tracking)
```

**ReMarketing Stage:**
```
Acknowledged-Remarketing
    ↓
AssignRecruiter
```

---

### Document Validation Rules:

**File Type Restrictions:**
- Resume/Documents: .pdf, .doc, .docx only
- Additional files: .pdf, .doc, .docx, .jpg, .png
- No executable or script files allowed

**File Size Limits:**
- Individual resume files: 10MB max
- Final document package: 15MB max
- Additional documents: 20MB max combined

**File Count Requirements:**
- Sales → Resume: Minimum 2 files (checklist + resume)
- Resume → Marketing: Minimum 3 files (resume + cover letter + checklist)
- Maximum 10 files per transition (includes additional docs)

---

### Comment Validation:

**Minimum Lengths (enforces quality documentation):**
- Quick actions (Acknowledge): 10 characters minimum
- Initial Call Done: 20 characters minimum
- Resume Completed: 25 characters minimum
- Stage transitions: 10-15 characters minimum

**Maximum Lengths:**
- Standard comments: 500 characters max
- Initial Call summary: 1000 characters max
- Notes field: 4000 characters max

---

### Assignment Rules:

**Recruiter Assignment:**
- Required in Marketing stage before client can work
- Only Marketing Manager can assign/change
- Must acknowledge stage before assignment
- Cannot assign same recruiter twice
- Assignment tracked in action history

**Client-Recruiter Relationship:**
- One active recruiter per client at a time
- Senior Recruiters can view their assigned clients
- Recruiters limited to assigned clients only
- Marketing Manager can view all clients

---

### State Consistency Rules:

**Client Status Synchronization:**
- ClientStatus field (database) = single source of truth
- PipelineStages track action history
- Status updated immediately on transition
- UpdatedTS timestamp refreshed on any change

**Transaction Atomicity:**
- All database changes wrapped in transaction
- Either all succeed or all rollback
- Prevents partial updates
- Ensures data consistency

**Concurrent Access:**
- Optimistic concurrency control
- Last write wins (with logging)
- Conflict detection via UpdatedTS

---

### Data Retention & History:

**Pipeline History Tracking:**
- All actions permanently recorded
- Stage transitions logged with from/to stages
- Performer identity and role captured
- Timestamps in UTC
- Complete audit trail maintained

**Document Retention:**
- All uploaded documents preserved
- Linked to specific pipeline stage
- Accessible throughout client lifecycle
- SharePoint provides version control

---

### Security & Authorization:

**Role Enforcement:**
- Backend validates ALL permissions
- Frontend mirrors for UX (not security)
- No client-side permission bypasses
- JWT token validates user identity

**Data Access Filtering:**
- Users see only permitted stages
- Recruiters limited to assigned clients
- Supervisors see team members' clients
- Admin sees everything

**Action Authorization:**
- Each action checked against user role
- Prerequisite validation
- Client state validation
- Conditional access rules (e.g., must be assigned)

---

## Summary of Key Business Insights

### Client Journey Timeline:
1. **Day 0:** Enrolled in Sales
2. **Day 1:** Qualified and moved to Resume (SLA)
3. **Day 1-3:** Resume created and documents prepared (SLA: 2 days)
4. **Day 3+:** Marketing begins, lasts up to 6 months
5. **Within 6 months:** Client placed OR moved to ReMarketing

### Success Metrics:
- **Sales SLA Compliance:** >90% within 1 day
- **Resume SLA Compliance:** >90% within 2 days
- **Marketing Success:** Placement within 6 months
- **Overall Conversion:** Sales → Placed percentage

### Critical Control Points:
1. **Priority Rating:** Gates Sales → Resume
2. **Required Documents:** Gates stage transitions
3. **Recruiter Assignment:** Required for Marketing work
4. **Acknowledgments:** Ensure ownership and accountability

### Workflow Philosophy:
- **Sequential with Flexibility:** Main stages flow forward, but lateral moves allowed
- **Role Specialization:** Each role owns specific stage expertise
- **Documentation Driven:** Documents required to prove completion
- **SLA Accountability:** Time-based metrics ensure progress
- **Reversibility:** Clients can return to earlier stages if needed

---

## Technical Implementation References

### Backend (C# .NET):
- **Controllers:** `CareerVestBackend/Controllers/PipelineApiController.cs`
- **Services:** `CareerVestBackend/Services/PipelineService.*.cs`
- **Rules Engine:** `CareerVestBackend/Services/PipelineRulesService.cs`
- **Models:** `CareerVestBackend/Models/`

### Frontend (React/TypeScript):
- **Pipeline UI:** `app/pipelines/components/Pipeline.tsx`
- **Constants:** `app/pipelines/components/constants.ts`
- **SLA Config:** `app/pipelines/components/slaConfig.ts`
- **Document Requirements:** `app/pipelines/components/documentRequirements.ts`
- **Actions:** `app/pipelines/actions/pipelineActions.ts`

---

## Quick Reference Diagrams

### Pipeline Flow Diagram:
```
Sales (1 day)
    ↓
Resume (2 days)
    ↓
Marketing (180 days)
    ↓
Placed ✓

Special States (accessible from any stage):
- Backed-Out (exit)
- On-Hold (pause)
- ReMarketing (retry)
```

### Role Access Matrix:
```
                Sales  Resume  Marketing  ReMarketing  Placed  Backed-Out  On-Hold
Admin            ✓      ✓       ✓          ✓           ✓       ✓           ✓
Sales Exec       ✓      -       -          -           ✓       ✓           ✓
Resume Writer    -      ✓       -          -           ✓       ✓           ✓
Marketing Mgr    View   View    ✓          ✓           ✓       ✓           ✓
Senior Recruiter View   View    ✓*         ✓*          ✓       ✓           ✓
Recruiter        View   View    ✓*         ✓*          -       -           -

* = Limited to assigned clients only
```

---

*Last Updated: [Auto-generated from codebase analysis]*
*Version: 3.0*
*Document Owner: Development Team*
