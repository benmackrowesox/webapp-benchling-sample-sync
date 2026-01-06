# TODO - Species Translation

## Completed
- [x] Create Norwegian species translation dictionary in `src/utils/norwayAdapter.ts`
- [x] Add `translateSpecies()` function for single species translation
- [x] Add `translateSpeciesString()` function for comma-separated species lists
- [x] Modify `parseNorwegianCSV()` to apply translation to the species field
- [x] Update `processing.ts` to import translation utility
- [x] Added 100+ Norwegian species translations

## Files Modified
1. `src/utils/norwayAdapter.ts` - Added species translation dictionary and functions
2. `src/maps/data/processing.ts` - Added import for translation utility

## Translation Coverage
The translation includes:
- Salmonids (Laks, Regnbueørret, Ørret → Salmon, Rainbow Trout, Trout)
- Flatfish (Kveite, Piggvar, Rødspette → Halibut, Turbot, Plaice)
- Cod family (Torsk, Sei, Lange → Cod, Saithe, Ling)
- Cleaner fish (Rognkjeks, Berggylt, Bergnebb → Lumpfish, Corkwing Wrasse, Ballan Wrasse)
- Shellfish (Blåskjell, Østers, Hummer → Blue Mussel, Oyster, Lobster)
- Seaweed (Sukkertare, Fingertare, Butare → Sugar Kelp, Digitated Kelp, Leaf Kelp)
- And many more species...

## Usage
Species are automatically translated when the CSV is loaded. The filter dropdowns and hover text will now show English species names instead of Norwegian.

