import { FirebaseFile } from "src/types/file";

export const getUniqueFileName = (
  fileName: string,
  existingFiles: FirebaseFile[],
) => {
  // Extract base name and extension
  const [baseName, extension] =
    fileName.split(".").length > 1
      ? [
          fileName.slice(0, fileName.lastIndexOf(".")),
          fileName.slice(fileName.lastIndexOf(".") + 1),
        ]
      : [fileName, ""];

  // Function to construct file name with extension
  const constructFileName = (name: string, ext: string) =>
    ext ? `${name}.${ext}` : name;

  // Initial file name
  let uniqueFileName = constructFileName(baseName, extension);
  let count = 1;

  // Check if file name already exists and generate a new one if needed
  while (
    existingFiles.find((existingFile) => existingFile.name === uniqueFileName)
  ) {
    uniqueFileName = constructFileName(`${baseName}_${count}`, extension);
    count++;
  }

  return uniqueFileName;
};
