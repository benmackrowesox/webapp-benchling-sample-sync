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

### Phase 1: Data Model Design
- [ ] Create `src/types/sync.ts` with sample sync interfaces
- [ ] Define `SyncedSample` interface with all sync fields
- [ ] Define `SyncMetadata` for tracking sync state
- [ ] Define `SyncQueueItem` for conflict handling and retries

### Phase 2: Firestore Collections
- [ ] `benchling_samples` collection for synced samples
- [ ] `benchling_samples/sync_metadata` document for tracking sync state
- [ ] `sync_queue` collection for pending operations

### Phase 3: Benchling API Integration
- [ ] Extend `src/lib/server/benchling.ts` with sample sync methods:
  - `fetchAllMetagenomicsSamples()` - Initial import from Benchling
  - `fetchSampleById(ebmId)` - Get specific sample
  - `createSample(sampleData)` - Create new sample in Benchling
  - `updateSample(ebmId, updates)` - Update sample in Benchling
  - `watchSamples()` - Subscribe to sample changes via Benchling API

### Phase 4: Webhook Handler
- [ ] Create `src/pages/api/webhooks/benchling.ts`
- [ ] Implement webhook endpoint to receive Benchling events
- [ ] Validate webhook signatures
- [ ] Process entity change events
- [ ] Update Firestore with changes from Benchling

### Phase 5: Sync Controller
- [ ] Create `src/lib/server/sync.ts`:
  - `syncToBenchling(sampleData)` - Push changes to Benchling
  - `syncFromBenchling(ebmId)` - Pull changes from Benchling
  - `resolveConflict(webappData, benchlingData)` - Handle conflicts
  - `scheduleSync()` - 10-minute polling fallback
  - `bulkSync()` - Initial import of all EBM samples

### Phase 6: Admin API Routes
- [ ] `src/pages/api/admin/samples/sync.ts` - Main sync operations
  - GET: Get sync status
  - POST: Trigger manual sync
  - DELETE: Clear sync queue
- [ ] `src/pages/api/admin/samples/benchling.ts` - Benchling CRUD
  - GET: List all synced samples
  - POST: Create new sample
  - PATCH: Update sample
- [ ] `src/pages/api/admin/samples/import.ts` - Initial import
  - POST: Import all EBM samples from Benchling

### Phase 7: Admin UI
- [ ] Create `src/pages/dashboard/admin/samples/index.tsx`
- [ ] Implement `src/components/admin/samples/samples-table.tsx`
- [ ] Implement `src/components/admin/samples/sync-status-badge.tsx`
- [ ] Implement `src/components/admin/samples/sample-editor.tsx`
- [ ] Add sync controls and status display

### Phase 8: Testing
- [ ] Test webhook receiving
- [ ] Test bidirectional sync
- [ ] Test conflict resolution
- [ ] Test initial import
- [ ] Test error handling

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

