# Canadian Aquaculture Site Support - Implementation Plan

## Tasks

### 1. Update Type Definitions
- [x] Add `CanadianSite` interface to `src/maps/types/site.ts`
- [x] Add `CanadianFilterOptions` interface
- [x] Add `CanadianMapData` interface
- [x] Update `MapRegion` to include Canadian regions

### 2. Add Processing Functions
- [x] Add DMS to Decimal Degrees converter for Nova Scotia
- [x] Add Web Mercator to WGS84 converter for Newfoundland
- [x] Add `buildCanadianHoverText()` function
- [x] Add `processCanadianSiteData()` function
- [x] Add `getCanadianFilterOptions()` function

### 3. Update Data Handler
- [x] Add Canadian CSV file paths and handling in `src/maps/data/sites.ts`
- [x] Add `handleCanadianSites()` function
- [x] Add sub-region detection (britishcolumbia, newbrunswick, newfoundland, novascotia, quebec)

### 4. Testing
- [x] Verify TypeScript compilation

