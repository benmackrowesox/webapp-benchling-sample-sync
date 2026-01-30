# TODO: Update aquaculture data paths

## Status: Completed ✅
- [x] Update Iceland sites API path
- [x] Update Norway sites API path
- [x] Update Canada sites API paths
- [x] Update UK sites API path
- [x] Add Chile map support

## Summary of Changes - Data Path Updates
All aquaculture data paths have been updated from `public/` to `aquaculture_site_data/`:

1. **Iceland** (`src/pages/api/iceland-sites.ts`):
   - Old: `public/iceland-sites.csv`
   - New: `aquaculture_site_data/iceland_aquaculture_sites/iceland-sites.csv`

2. **Norway** (`src/pages/api/norwegian-sites.ts`):
   - Old: Multiple paths in public/ (legacy fallback pattern)
   - New: `aquaculture_site_data/norway_aquaculture_sites/norwegian-sites-2.csv`

3. **Canada** (`src/pages/api/sites.ts`):
   - Old: `public/canadian_data/`
   - New: `aquaculture_site_data/canadian_data/`

4. **UK** (`src/pages/api/sites.ts`):
   - Old: `public/aquaculture-sites.csv`
   - New: `aquaculture_site_data/UK_aquaculture_sites/aquaculture-sites.csv`

## Summary of Changes - Chile Map Support

**Files Created:**
- `src/types/chile-site.ts` - Type definitions for Chile site data
- `src/pages/api/chile-sites.ts` - API endpoint for Chile data
- `src/components/chile-map.tsx` - Chile map component with filters

**Files Modified:**
- `src/pages/dashboard/uk-aquaculture-map.tsx` - Added Chile tab

