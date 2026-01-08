# TODO: Secure Help Pages for Authenticated Users

## Task Summary
Make help pages only accessible to authenticated users (admin or approved users) while keeping the "Help" button on the dashboard sidebar.

## Implementation Steps

### Step 1: Create authenticated help pages listing
- Create `src/pages/dashboard/help/index.tsx`
- Use `DashboardLayout` with `AdminOrApprovedGuard`
- Reuse the same layout and components as `/help/index.tsx`

### Step 2: Create authenticated single help page
- Create `src/pages/dashboard/help/[postId].tsx`
- Use `DashboardLayout` with `AdminOrApprovedGuard`
- Reuse the same layout and components as `/help/[postId].tsx`

### Step 3: Update dashboard sidebar
- Update `src/components/dashboard/dashboard-sidebar.tsx`
- Change Help link path from `/help` to `/dashboard/help`

## Status
- [x] Step 1: Create dashboard help index page
- [x] Step 2: Create dashboard help post detail page
- [x] Step 3: Update sidebar link

## Files Created/Modified
- Created: `src/pages/dashboard/help/index.tsx` - Authenticated help pages listing
- Created: `src/pages/dashboard/help/[postId].tsx` - Authenticated single help page
- Modified: `src/components/dashboard/dashboard-sidebar.tsx` - Updated Help link path

