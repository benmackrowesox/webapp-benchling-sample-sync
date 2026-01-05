import React from "react";
import type { FC } from "react";
import toast from "react-hot-toast";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { DocumentText } from "src/icons/document-text";
import { Download } from "src/icons/download";
import { Trash } from "src/icons/trash";

import { useTypedAuth } from "src/hooks/use-auth";
import { AdminGuard } from "src/components/authentication/auth-guard";

import { deleteFile, downloadFile } from "src/lib/client/firebase";
import { FirebaseFile } from "src/types/file";

interface FileListTableProps {
  viewOnly?: boolean;
  files: FirebaseFile[];
  triggerFetch: () => void;
  onFileRemoved?: (filename: string, path: string) => void;
}

export const FileListTable: FC<FileListTableProps> = ({
  viewOnly = false,
  files,
  triggerFetch,
  onFileRemoved,
}) => {
  const { user } = useTypedAuth();

  const onOpenFile = (fileUrl: string) => {
    if (!fileUrl) {
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const onDownloadFile = (fileUrl: string) => {
    if (!fileUrl) {
      return;
    }
    downloadFile(fileUrl);
  };

  const onDeleteFile = (file: FirebaseFile) => {
    if (!file?.url || (!user?.isAdmin && viewOnly)) {
      return;
    }

    try {
      deleteFile(file.url).then(() => {
        if (onFileRemoved) {
          onFileRemoved(file.name, file.url);
        }
        triggerFetch();
      });
    } catch (error) {
      toast.error(`There was an error deleting file ${file.name}.`);
    }
  };

  if (files.length === 0) {
    return (
      <Box sx={{ overflow: "auto" }}>
        <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
          <Typography variant="body2">No files yet.</Typography>
        </Box>
      </Box>
    );
  }

  const renderViewOnly = (children: React.ReactNode) => {
    if (viewOnly) {
      return <AdminGuard>{children}</AdminGuard>;
    }

    return children;
  };

  return (
    <Box sx={{ overflow: "auto" }}>
      <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File name</TableCell>
              <TableCell sx={{ width: 120, p: 0 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.url}>
                <TableCell>{file.name}</TableCell>
                <TableCell sx={{ width: 120, p: 0 }} align="center">
                  <IconButton
                    aria-label="open report"
                    onClick={() => onOpenFile(file.url)}
                  >
                    <DocumentText />
                  </IconButton>
                  <IconButton
                    aria-label="download report"
                    onClick={() => onDownloadFile(file.url)}
                    color="primary"
                  >
                    <Download />
                  </IconButton>
                  {renderViewOnly(
                    <IconButton
                      aria-label="download report"
                      onClick={() => onDeleteFile(file)}
                      color="error"
                    >
                      <Trash />
                    </IconButton>,
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};
