# Chile Data Translation Plan

## Goal
Translate all Chile aquaculture site data from Spanish to English.

## Status: COMPLETED ✓

## Tasks Completed

### 1. Add Translation Dictionaries ✓
- [x] Species translations (already exists)
- [x] Region translations dictionary
- [x] Concession Type translations dictionary
- [x] Species Type translations dictionary
- [x] Status translations dictionary

### 2. Update Translation Functions ✓
- [x] Added `translateChileStatus()` to return English values
- [x] Added `translateChileRegion()` function
- [x] Added `translateChileConcessionType()` function
- [x] Added `translateChileSpeciesType()` function
- [x] Removed old `normalizeChileStatus()` function

### 3. Apply Translations in Data Processing ✓
- [x] Updated `processChileData()` to apply all translations

### 4. Update UI Labels ✓
- [x] Updated `buildChileHoverText()` to use English labels
- [x] Updated `getStatusColor()` in chile-map.tsx for English status values

## Translation Mappings

### Regions (Spanish → English)
- "REGIÓN DE ARICA Y PARINACOTA" → "Arica and Parinacota"
- "REGIÓN DE TARAPACÁ" → "Tarapacá"
- "REGIÓN DE ANTOFAGASTA" → "Antofagasta"
- "REGIÓN DE ATACAMA" → "Atacama"
- "REGIÓN DE COQUIMBO" → "Coquimbo"
- "REGIÓN DE VALPARAÍSO" → "Valparaíso"
- "REGIÓN DEL LIBERTADOR BERNARDO O'HIGGINS" → "O'Higgins"
- "REGIÓN DEL MAULE" → "Maule"
- "REGIÓN DE ÑUBLE" → "Ñuble"
- "REGIÓN DEL BIOBÍO" → "Bío Bío"
- "REGIÓN DE LA ARAUCANÍA" → "Araucanía"
- "REGIÓN DE LOS RÍOS" → "Los Ríos"
- "REGIÓN DE LOS LAGOS" → "Los Lagos"
- "REGIÓN DE AISÉN DEL GENERAL CARLOS IBÁÑEZ DEL CAMPO" → "Aysén"
- "REGIÓN DE MAGALLANES Y DE LA ANTÁRTICA CHILENA" → "Magallanes"

### Status (Spanish → English)
- "Vigente" → "Active"
- "En Trámite" → "Pending"
- "Caduco" → "Expired"
- "Renovación" → "Renewal"
- "Suspendido" → "Suspended"

### Concession Types (Spanish → English)
- "Acuícola" → "Aquaculture"
- "Pesquera" → "Fishing"

### Species Types (Spanish → English)
- "Peces" → "Fish"
- "Moluscos" → "Shellfish"
- "Crustáceos" → "Crustaceans"
- "Algas" → "Seaweed"

### Hover Text Labels (Spanish → English)
- "Concesión N°:" → "Concession No.:"

