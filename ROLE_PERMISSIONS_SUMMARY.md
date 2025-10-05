# Pipeline Role Permissions & Functionality Summary

## Question 1: Does Marketing Manager have "Reassign Recruiter" functionality?

**Answer: YES** - Marketing Manager has **AssignRecruiter** functionality (not called "reassign" but serves the same purpose).

### Marketing Manager Permissions:

#### Marketing Stage:
1. **Acknowledged-Marketing** - Must complete first
2. **AssignRecruiter** - Can assign a recruiter to the client

#### Remarketing Stage:
1. **Acknowledged-Remarketing** - Must complete first
2. **AssignRecruiter** - Can assign a recruiter to the client

### How It Works:
- Marketing Manager **MUST** acknowledge the stage first
- Then they can **assign a recruiter** via the `AssignRecruiter` action
- If a recruiter is already assigned, the action shows as "completed"
- Marketing Manager can also use `ChangeRecruiter` action to reassign

**Key Code Reference:**
```typescript
// From constants.ts lines 168-176
if (userRoleLower === "marketing_manager") {
  return ["Acknowledged-Marketing", "AssignRecruiter"];
}
```

---

## Question 2: Does Recruiter role have any functionality in pipelines?

**Answer: LIMITED** - Recruiter role can **VIEW** marketing/remarketing stages but has **NO ACTIONS** they can perform.

### Recruiter Role Permissions:

#### Can Access:
- ✅ **Marketing stage** - Read-only access
- ✅ **Remarketing stage** - Read-only access

#### Cannot Access:
- ❌ Sales stage
- ❌ Resume stage
- ❌ No actions in marketing
- ❌ No actions in remarketing

#### What They Can Do:
- **View clients** in marketing and remarketing stages
- **See client details** (name, email, phone, status, etc.)
- **Monitor progress** but cannot perform any actions

#### What They CANNOT Do:
- ❌ Cannot acknowledge stages
- ❌ Cannot assign recruiters
- ❌ Cannot upload documents
- ❌ Cannot rate candidates
- ❌ Cannot move clients between stages
- ❌ Cannot complete any required actions

**Key Code Reference:**
```typescript
// From constants.ts lines 177-185
if (userRoleLower === "recruiter") {
  // They can see the stage but only Marketing Manager can perform actions
  return []; // Empty array = no actions
}

// From constants.ts lines 620-623
if (userRoleLower === "recruiter") {
  return department === "marketing" || department === "remarketing";
}
```

---

## Complete Role Hierarchy & Permissions

### 1. **Admin** (Highest - Level 0)
- ✅ Full access to ALL stages
- ✅ Can perform ALL actions in every stage
- ✅ Can view all clients regardless of assignment

### 2. **Marketing_Manager** (Level 1)
- ✅ Access to Marketing and Remarketing stages
- ✅ Required Actions:
  - **Marketing**: Acknowledged-Marketing, AssignRecruiter
  - **Remarketing**: Acknowledged-Remarketing, AssignRecruiter
- ✅ Can assign/reassign recruiters
- ✅ Controls recruiter workflow

### 3. **Senior_Recruiter** (Level 2)
- ✅ Access to Marketing and Remarketing stages
- ⚠️ **NO ACTIONS** - Read-only access
- ℹ️ Can view but cannot perform actions
- ℹ️ Must wait for Marketing Manager to acknowledge first

### 4. **Recruiter** (Level 3)
- ✅ Access to Marketing and Remarketing stages
- ⚠️ **NO ACTIONS** - Read-only access
- ℹ️ Lowest level recruiter role
- ℹ️ Visibility only, no execution rights

### 5. **Sales_Executive** (Level 4)
- ✅ Access to Sales stage only
- ✅ Required Actions:
  - RateCandidate
  - Upload Required Docs - Sales
- ❌ Cannot access Marketing/Remarketing/Resume stages

### 6. **Resume_Writer** (Level 5)
- ✅ Access to Resume stage only
- ✅ Required Actions:
  - Acknowledged
  - Initial Call Done
  - Resume Completed
  - Upload Required Docs - Resume
- ❌ Cannot access Sales/Marketing/Remarketing stages

---

## Workflow Summary

### Marketing Stage Workflow:
1. **Marketing Manager** acknowledges client in marketing
2. **Marketing Manager** assigns a recruiter via `AssignRecruiter` action
3. **Recruiter/Senior_Recruiter** can now VIEW the client (read-only)
4. Client moves to remarketing if needed

### Remarketing Stage Workflow:
1. **Marketing Manager** acknowledges client in remarketing
2. **Marketing Manager** assigns a recruiter via `AssignRecruiter` action
3. **Recruiter/Senior_Recruiter** can VIEW the client (read-only)

### Key Insight:
**Recruiters are PASSIVE participants** in the pipeline system. They can see clients assigned to them but cannot take any pipeline actions. Their work happens outside the pipeline system (conducting interviews, managing candidates, etc.).

---

## AssignRecruiter Action Details

**Location in Code:** `constants.ts` lines 515-520

```typescript
AssignRecruiter: {
  action: "AssignRecruiter",
  fileType: "",
  description: "",
  required: false,
}
```

**Who Can Use:**
- ✅ Admin (all stages)
- ✅ Marketing_Manager (marketing & remarketing stages)
- ❌ Senior_Recruiter (no actions)
- ❌ Recruiter (no actions)
- ❌ Sales_Executive (not in their stages)
- ❌ Resume_Writer (not in their stages)

**When Available:**
- Marketing stage: After Marketing Manager acknowledges
- Remarketing stage: After Marketing Manager acknowledges

**Prerequisites:**
- Marketing: `Acknowledged-Marketing_Manager-Marketing`
- Remarketing: `Acknowledged-Marketing_Manager-Remarketing`

---

## Summary Table

| Role | Sales | Resume | Marketing | Remarketing | Can Assign Recruiter |
|------|-------|--------|-----------|-------------|---------------------|
| Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Yes |
| Marketing_Manager | ❌ No | ❌ No | ✅ Full | ✅ Full | ✅ Yes |
| Senior_Recruiter | ❌ No | ❌ No | 👁️ View Only | 👁️ View Only | ❌ No |
| Recruiter | ❌ No | ❌ No | 👁️ View Only | 👁️ View Only | ❌ No |
| Sales_Executive | ✅ Full | ❌ No | ❌ No | ❌ No | ❌ No |
| Resume_Writer | ❌ No | ✅ Full | ❌ No | ❌ No | ❌ No |

---

**Generated:** October 3, 2025
**Source:** `/app/pipelines/components/constants.ts`
