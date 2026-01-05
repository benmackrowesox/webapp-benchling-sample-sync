export function serviceFromId(id: string) {
  if (id.startsWith("EBq")) {
    return "qPCR";
  } else if (id.startsWith("EBM")) {
    return "Metagenomics";
  } else if (id.startsWith("EBGS")) {
    return "GenomeSequencing";
  } else {
    return "Unknown";
  }
}
