import { FC, ReactNode, useEffect, useState } from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import toast from "react-hot-toast";

import { FileDropzone } from "src/components/file-dropzone";
import { AdminGuard } from "src/components/authentication/auth-guard";
import {
  uploadPDFToUserFolder,
  getFilesInFolder,
} from "src/lib/client/firebase";

import { FileListTable } from "src/components/dashboard/account/file-list-table";
import { PageHelpSection } from "src/components/dashboard/page-help-section";
import { FirebaseFile } from "src/types/file";
import { getUniqueFileName } from "src/utils/file-utils";

import "react-phone-input-2/lib/style.css";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_NUMBER_OF_FILES = 10;

interface FileManagementProps {
  userId: string;
  viewOnly?: boolean;
  title: string;
  folderNames: string[];
  uploadFolderName?: string;
  helpSection: ReactNode;
  onFileUploaded?: (filename: string, path: string) => void;
  onFileRemoved?: (filename: string, path: string) => void;
}

export const FileManagement: FC<FileManagementProps> = (props) => {
  const {
    userId,
    viewOnly = false,
    title,
    folderNames,
    uploadFolderName,
    helpSection,
    onFileUploaded,
    onFileRemoved,
  } = props;
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [files, setFiles] = useState<FirebaseFile[]>([]);
  const [fetch, setFetch] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const getAccountFiles = async () => {
      const allFilesInFolders = await Promise.all(
        folderNames.map((folderName) =>
          getFilesInFolder(`new_users/${userId}/${folderName}`),
        ),
      );

      setFiles(allFilesInFolders.flat());
      setFetch(false);
    };
    getAccountFiles();
  }, [userId, folderNames, fetch]);

  const onDropFile = async (droppedFiles: File[]) => {
    if (files.length + droppedFiles.length > MAX_NUMBER_OF_FILES) {
      toast.error(`Maximum number of files exeeded.`);
      return;
    }

    const newFilesToUpload = droppedFiles.filter((file) => {
      const existingFile = filesToUpload.find(
        (fileToUpload) => fileToUpload.name === file.name,
      );

      if (existingFile) {
        toast.error(`File ${file.name} is already selected.`);
      }

      return !existingFile;
    });

    setFilesToUpload([...filesToUpload, ...newFilesToUpload]);
  };

  const onUploadFiles = async () => {
    if (filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);
    try {
      await Promise.all(
        filesToUpload.map((fileToUpload) => onUploadFile(fileToUpload)),
      );
    } catch (error) {
      toast.error("There was an error uploading files.");
    }

    setFilesToUpload([]);
    setFetch(true);
    setIsUploading(false);
  };

  const onUploadFile = async (file: File) => {
    const uniqueName = getUniqueFileName(file.name, files);
    const uploadFolder =
      uploadFolderName ?? (folderNames.length > 0 ? folderNames[0] : null);
    if (!uploadFolder) {
      return;
    }
    await uploadPDFToUserFolder(
      userId,
      `${uploadFolder}/${uniqueName}`,
      file,
    ).then((path) => {
      // console.log("path to upload ", path);
      if (onFileUploaded) {
        onFileUploaded(uniqueName, path);
      }
    });
  };

  const onRemoveFile = (file: File) => {
    setFilesToUpload(
      filesToUpload.filter((fileToUpload) => fileToUpload.name !== file.name),
    );
  };

  const onRemoveFiles = () => {
    setFilesToUpload([]);
  };

  const onTriggerFetch = () => {
    setFetch(true);
  };

  const FileDropzoneWrapper = viewOnly ? AdminGuard : Box;

  return (
    <Box sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Grid container spacing={3} direction="column">
            <Grid item md={4} xs={12}>
              <Typography variant="h6" mb={2}>
                {title}
              </Typography>
              {helpSection && <PageHelpSection>{helpSection}</PageHelpSection>}
              <FileListTable
                viewOnly={viewOnly}
                files={files}
                triggerFetch={onTriggerFetch}
                onFileRemoved={onFileRemoved}
              />
            </Grid>
            <Grid item md={8} xs={12}>
              <FileDropzoneWrapper>
                <Box sx={{ mt: 3 }}>
                  <FileDropzone
                    accept={{
                      "application/pdf": [], // .pdf
                      "image/jpeg": [], //.jpeg .jpg
                      "image/png": [], // .png
                      "text/csv": [], // .csv
                      "application/msword": [], // .doc
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        [], // .docx
                    }}
                    files={filesToUpload}
                    multiple
                    maxSize={MAX_FILE_SIZE}
                    maxFiles={MAX_NUMBER_OF_FILES}
                    disabled={isUploading}
                    onDrop={onDropFile}
                    onUpload={onUploadFiles}
                    onRemove={onRemoveFile}
                    onRemoveAll={onRemoveFiles}
                  />
                </Box>
              </FileDropzoneWrapper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
