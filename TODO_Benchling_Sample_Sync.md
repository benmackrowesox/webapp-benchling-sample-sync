# TODO: Two-Way Benchling Sample Sync Feature

## Overview
Implement real-time two-way synchronization between the webapp and Benchling for metagenomics samples (EBM prefixed sample IDs).

## Requirements Summary
- **Sample Type**: Metagenomics samples (entity IDs prefixed with "EBM")
- **Sync Fields**:
  - Sample ID number
  - Client name
  - Sample type
  - Sample format
  - Sample date
  - Sample status
- **Sync Mode**: Real-time via webhooks, with 10-minute polling fallback
- **Conflict Resolution**: Most recent change wins

---

## Implementation Phases

### Phase 1: Data Model Design ✅ COMPLETED
- [x] Create `src/types/sync.ts` with sample sync interfaces
- [x] Define `SyncedSample` interface with all sync fields
- [x] Define `SyncMetadata` for tracking sync state
- [x] Define `SyncQueueItem` for conflict handling and retries
- [x] **Updated**: Configured actual Benchling field IDs from esox.benchling.com

### Phase 2: Firestore Collections
Firestore collection structure documented in types:
- [x] `benchling_samples` collection for synced samples
- [x] `benchling_samples/sync_metadata` document for tracking sync state
- [x] `sync_queue` collection for pending operations

### Phase 3: Benchling API Integration ✅ COMPLETED
- [x] Extend `src/lib/server/benchling-sync.ts` with sample sync methods:
  - [x] `fetchAllMetagenomicsSamples()` - Initial import from Benchling
  - [x] `fetchSampleById(ebmId)` - Get specific sample
  - [x] `createSample(sampleData)` - Create new sample in Benchling
  - [x] `updateSample(ebmId, updates)` - Update sample in Benchling
- [x] **Updated**: Field mapping functions to use actual Benchling field IDs

### Phase 4: Webhook Handler ✅ COMPLETED
- [x] Create `src/pages/api/webhooks/benchling.ts`
- [x] Implement webhook endpoint to receive Benchling events
- [x] Validate webhook signatures
- [x] Process entity change events
- [x] Update Firestore with changes from Benchling

### Phase 5: Sync Controller ✅ COMPLETED
- [x] Create `src/lib/server/sync.ts`:
  - [x] `syncToBenchling(sampleData)` - Push changes to Benchling
  - [x] `syncFromBenchling(ebmId)` - Pull changes from Benchling
  - [x] `resolveConflict(webappData, benchlingData)` - Handle conflicts
  - [x] `processSyncQueue()` - Process pending sync operations
  - [x] `importFromBenchling()` - Initial import of all EBM samples
  - [x] `createSample()` / `updateSample()` / `deleteSample()` - CRUD operations
- [x] **Updated**: Fixed sampleId extraction from entityRegistryId (e.g., "EBM123" → "123")

### Phase 6: Admin API Routes ✅ COMPLETED
- [x] `src/pages/api/admin/samples/sync.ts` - Main sync operations
  - [x] GET: Get sync status
  - [x] POST: Trigger manual sync, process queue
  - [x] DELETE: Clear sync queue
- [x] `src/pages/api/admin/samples/benchling.ts` - Benchling CRUD
  - [x] GET: List all synced samples
  - [x] POST: Create new sample
  - [x] PATCH: Update sample
  - [x] DELETE: Delete sample
- [x] `src/pages/api/admin/samples/import.ts` - Initial import
  - [x] POST: Import all EBM samples from Benchling

### Phase 7: Admin UI ✅ COMPLETED
- [x] Create `src/pages/dashboard/admin/samples/index.tsx`
- [x] Implement `src/components/admin/samples/samples-table.tsx`
- [x] Implement `src/components/admin/samples/sync-status-badge.tsx`
- [x] Implement `src/components/admin/samples/sample-editor.tsx`

### Phase 8: Configuration & Setup - IN PROGRESS
**Status**: Benchling IDs configured, setup guide created

- [x] Configure Benchling schema ID: `ts_NJDS3UwU`
- [x] Configure Benchling registry ID: `src_xro8e9rf`
- [x] Configure field mappings:
  - [x] Client Name: `tsf_1ItF8QUi`
  - [x] Sample Type: `tsf_E1ktWT2b`
  - [x] Sample Format: `tsf_stZCS21smu`
  - [x] Sample Date: `tsf_MKDjGziQ`
  - [x] Sample Status: `tsf_PcrOui0bQJ`
- [x] Create setup guide: `BENCHLING_SYNC_SETUP_GUIDE.md`

### Phase 9: Testing - PENDING
- [ ] Add environment variables to `.env.local`
- [ ] Configure webhook in Benchling dashboard
- [ ] Test webhook receiving
- [ ] Test bidirectional sync (webapp → Benchling)
- [ ] Test bidirectional sync (Benchling → webapp)
- [ ] Test conflict resolution
- [ ] Test initial import of 1046 EBM samples
- [ ] Test error handling

---

## Files Created

### Type Definitions:
- `src/types/sync.ts` - Core sync types and interfaces

### Server Libraries:
- `src/lib/server/benchling-sync.ts` - Benchling API integration
- `src/lib/server/sync.ts` - Sync controller and operations

### API Routes:
- `src/pages/api/webhooks/benchling.ts` - Webhook handler
- `src/pages/api/admin/samples/sync.ts` - Sync operations API
- `src/pages/api/admin/samples/benchling.ts` - Sample CRUD API
- `src/pages/api/admin/samples/import.ts` - Import API

### Admin Pages:
- `src/pages/dashboard/admin/samples/index.tsx` - Main admin page

### Components:
- `src/components/admin/samples/samples-table.tsx` - Sample table
- `src/components/admin/samples/sync-status-badge.tsx` - Sync status indicator
- `src/components/admin/samples/sample-editor.tsx` - Sample form

---

## Field Mapping

### Benchling → Firestore
| Benchling Field | Firestore Field |
|-----------------|-----------------|
| entityRegistryId (e.g., EBM123) | sampleId |
| Client Name field | clientName |
| Sample Type field | sampleType |
| Sample Format field | sampleFormat |
| Date/Time Sampled field | sampleDate |
| Status field | sampleStatus |
| Last Modified | lastModified |

---

## Sync Flow

### Webapp → Benchling (Push)
1. User creates/updates sample in webapp
2. Save to Firestore `benchling_samples`
3. Call `syncToBenchling()` via API
4. Update Benchling via API
5. Update Firestore `lastSyncedFromWebapp`

### Benchling → Webapp (Pull)
1. Benchling triggers webhook on change
2. Webhook handler receives event
3. Fetch updated sample data from Benchling
4. Compare with Firestore data
5. Apply most recent change
6. Update Firestore `lastSyncedFromBenchling`

---

## Conflict Resolution Strategy
1. Compare `lastModified` timestamps
2. Most recent change wins
3. Log conflicts in `sync_queue` for audit

---

## API Rate Limiting Considerations
- Use batch operations where possible
- Implement exponential backoff
- Queue large operations

---

## Initial Import Process
1. Fetch all EBM samples from Benchling (paginated)
2. Create Firestore documents for each
3. Set `createdIn: 'benchling'`
4. Track import progress in `sync_metadata`

---

## Files to Create/Modify

### New Files:
- `src/types/sync.ts`
- `src/lib/server/sync.ts`
- `src/lib/server/benchling-sync.ts`
- `src/pages/api/webhooks/benchling.ts`
- `src/pages/api/admin/samples/sync.ts`
- `src/pages/api/admin/samples/benchling.ts`
- `src/pages/api/admin/samples/import.ts`
- `src/pages/dashboard/admin/samples/index.tsx`
- `src/components/admin/samples/samples-table.tsx`
- `src/components/admin/samples/sync-status-badge.tsx`
- `src/components/admin/samples/sample-editor.tsx`

### Existing Files to Modify:
- `src/lib/server/benchling.ts` - Add sync methods
- `src/types/order.ts` - Add sample sync types

---

## Benchling API Endpoints Needed
- GET `/custom-entities` - List samples (filtered by schema)
- POST `/custom-entities:bulk-create` - Create samples
- PATCH `/custom-entities/{id}` - Update sample
- Webhook configuration for custom entity changes

