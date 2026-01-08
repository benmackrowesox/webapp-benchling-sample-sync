# Order System to Project System Refactor

## Overview
This refactor removes the order approval workflow and replaces it with a direct organization-linked project system where admins create projects for users' samples.

## Important Constraints
- **DO NOT DELETE** any data from `new_orders` collection - archive/move only
- Allow admins to link existing `new_orders` to new `projects`
- Old orders should remain viewable for historical purposes

---

## Phase 1: Type Definitions & Data Models

### Task 1.1: Add Organisation Type
- [ ] Create `src/types/organisation.ts` with:
  - `Organisation` interface (id, name, createdAt, users[])
  - Export types

### Task 1.2: Add Project Type
- [ ] Create `src/types/project.ts` with:
  - `ProjectStatus` type (active, completed, archived)
  - `Project` interface (id, title, organisationId, services, samples, createdAt, linkedOrderIds[])
  - `ProjectSample` interface
  - Export types

### Task 1.3: Update User Type
- [ ] Modify `src/types/user.ts`:
  - Add `organisationId` field to `firestoreUser`
  - Add `organisationId` to `InternalUser`

---

## Phase 2: Firestore Data Access Layer

### Task 2.1: Create Organisation Store
- [ ] Create `src/lib/client/store/organisations.ts`:
  - `OrganisationStore` class
  - Methods: `getOrganisations()`, `getOrganisation()`, `createOrganisation()`, `selectOrganisation()`

### Task 2.2: Create Project Store
- [ ] Create `src/lib/client/store/projects.ts`:
  - `ProjectStore` class
  - Methods: `getProjects()`, `getProject()`, `createProject()`, `getProjectsByOrganisation()`

### Task 2.3: Update Firebase Admin Helper
- [ ] Update `src/lib/server/firebase-admin.ts`:
  - Add `getOrganisation()` function
  - Add `createOrganisation()` function
  - Add `getUserOrganisation()` function

---

## Phase 3: API Endpoints

### Task 3.1: Organisation API
- [ ] Create `src/pages/api/organisations/index.ts`:
  - GET: List all organisations (admin)
  - POST: Create new organisation (admin)
- [ ] Create `src/pages/api/organisations/[organisationId].ts`:
  - GET: Get organisation details
  - PATCH: Update organisation
  - DELETE: Archive organisation

### Task 3.2: Projects API
- [ ] Create `src/pages/api/projects/index.ts`:
  - GET: List projects (by organisation for users, all for admin)
  - POST: Create new project (admin only)
- [ ] Create `src/pages/api/projects/[projectId].ts`:
  - GET: Get project details
  - PATCH: Update project
  - DELETE: Archive project
- [ ] Create `src/pages/api/projects/[projectId]/link-order.ts`:
  - POST: Link existing order to project (admin)

### Task 3.3: Samples API (New)
- [ ] Create `src/pages/api/projects/[projectId]/samples.ts`:
  - GET: List samples in project
  - POST: Add sample to project

---

## Phase 4: UI Components - Organisation

### Task 4.1: Update Organisation Popover
- [ ] Modify `src/components/dashboard/organization-popover.tsx`:
  - Fetch organisations from Firestore
  - Allow creating new organisation (admin)
  - Allow selecting organisation
  - Store selection in context/localStorage

### Task 4.2: Create Organisation Select Component
- [ ] Create `src/components/dashboard/organisation/organisation-select.tsx`:
  - Dropdown to select organisation
  - Show selected organisation details
  - Admin: Create new organisation option

### Task 4.3: Create Organisation Management Page (Admin)
- [ ] Create `src/pages/dashboard/organisations/index.tsx`:
  - List all organisations
  - Add/Edit/Delete organisations
  - Manage users in organisation

---

## Phase 5: UI Components - Projects

### Task 5.1: Create Project List Page (User View)
- [ ] Create `src/pages/dashboard/projects/index.tsx`:
  - List projects for user's organisation
  - Show linked orders in each project
  - Navigate to project details

### Task 5.2: Create Project Details Page
- [ ] Create `src/pages/dashboard/projects/[projectId]/index.tsx`:
  - Show project details
  - List linked orders
  - List samples in project
  - Add samples to project

### Task 5.3: Create Project Creation Page (Admin)
- [ ] Create `src/pages/dashboard/projects/new.tsx`:
  - Select organisation
  - Enter project title/description
  - Select services
  - Select sample types
  - Optionally link existing orders

### Task 5.4: Create Link Order to Project Modal
- [ ] Create `src/components/dashboard/project/link-order-modal.tsx`:
  - Search existing orders
  - Select order to link
  - Confirm linking

---

## Phase 6: Sample Submission (Project-based)

### Task 6.1: Create Project Sample Submission Page
- [ ] Create `src/pages/dashboard/projects/[projectId]/sample-submission.tsx`:
  - Similar to order sample submission but project-based
  - Add samples directly to project
  - Submit samples for processing

### Task 6.2: Create Sample Submission Components
- [ ] Create/modify components in `src/components/dashboard/project/`:
  - `project-sample-submission-table.tsx`
  - `project-sample-submission-summary.tsx`
  - `project-metadata-edit-list.tsx`

---

## Phase 7: Navigation & Sidebar Updates

### Task 7.1: Update Dashboard Sidebar
- [ ] Modify `src/components/dashboard/dashboard-sidebar.tsx`:
  - Replace "Orders" section with "Projects" section
  - Add "Organisations" link (admin only)
  - Keep "Orders" link for viewing historical orders

### Task 7.2: Add Project Navigation Guard
- [ ] Update `src/components/authentication/auth-guard.tsx`:
  - Add guard for project access (user must have organisation)

---

## Phase 8: Legacy Order Pages (Archived)

### Task 8.1: Keep Order Pages for Historical View
- [ ] Keep `src/pages/dashboard/orders/index.tsx` but:
  - Rename to "Order History" or "Archived Orders"
  - Make read-only (no new orders)
  - Show orders linked to projects

### Task 8.2: Keep Order Details Page
- [ ] Keep `src/pages/dashboard/orders/[orderId].tsx` but:
  - Add banner indicating if linked to project
  - Link to parent project if exists

---

## Phase 9: Registration & User Management

### Task 9.1: Update Registration Flow
- [ ] Modify `src/components/authentication/firebase-register.tsx`:
  - After registration, allow selecting organisation
  - If organisation doesn't exist, allow creating (or request admin)

### Task 9.2: Update User Profile
- [ ] Modify `src/pages/dashboard/account/index.tsx`:
  - Show user's organisation
  - Allow changing organisation (admin approval?)

---

## Phase 10: Testing & Cleanup

### Task 10.1: Update Firestore Rules
- [ ] Review and update Firestore security rules:
  - Organisation access rules
  - Project access rules (org members only)
  - Sample access rules

### Task 10.2: Data Migration Script (Optional)
- [ ] Create script to:
  - Archive `new_orders` collection
  - Create initial `organisations` from existing companies
  - Link existing users to organisations

### Task 10.3: Integration Testing
- [ ] Test organisation creation
- [ ] Test project creation
- [ ] Test linking orders to projects
- [ ] Test sample submission to projects
- [ ] Test user registration with organisation

---

## File Changes Summary

### New Files to Create
```
src/types/organisation.ts
src/types/project.ts
src/lib/client/store/organisations.ts
src/lib/client/store/projects.ts
src/pages/api/organisations/index.ts
src/pages/api/organisations/[organisationId].ts
src/pages/api/projects/index.ts
src/pages/api/projects/[projectId].ts
src/pages/api/projects/[projectId]/link-order.ts
src/pages/api/projects/[projectId]/samples.ts
src/components/dashboard/organisation/organisation-select.tsx
src/components/dashboard/project/link-order-modal.tsx
src/components/dashboard/project/sample-submission-table.tsx
src/pages/dashboard/organisations/index.tsx
src/pages/dashboard/projects/index.tsx
src/pages/dashboard/projects/new.tsx
src/pages/dashboard/projects/[projectId]/index.tsx
src/pages/dashboard/projects/[projectId]/sample-submission.tsx
```

### Files to Modify
```
src/types/user.ts - Add organisationId
src/lib/server/firebase-admin.ts - Add organisation helpers
src/components/dashboard/organization-popover.tsx - Fetch from Firestore
src/components/dashboard/dashboard-sidebar.tsx - Update navigation
src/components/authentication/firebase-register.tsx - Add organisation selection
```

### Files to Keep (Archived Mode)
```
src/pages/dashboard/orders/index.tsx - Read-only historical view
src/pages/dashboard/orders/[orderId].tsx - Read-only with project link
src/pages/dashboard/orders/request.tsx - Keep but may disable new orders
```

### Files to Possibly Deprecate (But Keep Data)
```
src/lib/client/store/orders.ts - May keep for historical data access
src/lib/client/stateMachine.ts - Remove order status machine
```

---

## Progress Tracking

- [x] Branch created: `blackboxai/refactor-order-system-to-projects`
- [x] Phase 1: Type Definitions & Data Models
  - [x] Task 1.1: Add Organisation Type (`src/types/organisation.ts`)
  - [x] Task 1.2: Add Project Type (`src/types/project.ts`)
  - [x] Task 1.3: Update User Type (`src/types/user.ts`)
- [x] Phase 2: Firestore Data Access Layer
  - [x] Task 2.1: Create Organisation Store (`src/lib/client/store/organisations.ts`)
  - [x] Task 2.2: Create Project Store (`src/lib/client/store/projects.ts`)
  - [x] Task 2.3: Update Firebase Admin Helper (`src/lib/server/firebase-admin.ts`)
- [x] Phase 3: API Endpoints
  - [x] Task 3.1: Organisation API (`src/pages/api/organisations/`)
  - [x] Task 3.2: Projects API (`src/pages/api/projects/`)
  - [x] Task 3.3: Samples API (`src/pages/api/projects/[projectId]/samples.ts`)
- [x] Phase 4: UI Components - Organisation
  - [x] Task 4.1: Update Organisation Popover (`src/components/dashboard/organization-popover.tsx`)
  - [x] Task 4.2: Create Organisation Management Page (`src/pages/dashboard/organisations/index.tsx`)
- [x] Phase 5: UI Components - Projects
  - [x] Task 5.1: Create Project List Page (`src/pages/dashboard/projects/index.tsx`)
  - [x] Task 5.2: Create Project Details Page (`src/pages/dashboard/projects/[projectId]/index.tsx`)
  - [x] Task 5.3: Create Project Creation Page (`src/pages/dashboard/projects/new.tsx`)
  - [x] Task 5.4: Create Link Order to Project Modal (integrated in project details)
- [x] Phase 6: Sample Submission (Project-based)
  - [x] Task 6.1: Create Project Sample Submission Page (`src/pages/dashboard/projects/[projectId]/sample-submission.tsx`)
- [x] Phase 7: Navigation & Sidebar Updates
  - [x] Task 7.1: Update Dashboard Sidebar (`src/components/dashboard/dashboard-sidebar.tsx`)
- [x] Phase 8: Legacy Order Pages (Archived)
  - [x] Task 8.1: Add legacy banner to orders list page (`src/pages/dashboard/orders/index.tsx`)
  - [x] Task 8.2: Add legacy banner to order request page (`src/pages/dashboard/orders/request.tsx`)
- [ ] Phase 9: Registration & User Management
- [ ] Phase 10: Testing & Cleanup



