import React, { useRef } from "react";
import type { FC } from "react";
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
import { useTypedAuth } from "src/hooks/use-auth";

import { SeverityPill } from "src/components/severity-pill";
import { sampleSeverityMap } from "src/components/dashboard/order/order-list-table";
import { SampleName } from "src/components/dashboard/order/sample-name";
import { AdminGuard } from "src/components/authentication/auth-guard";

import { DocumentText } from "src/icons/document-text";
import { Download } from "src/icons/download";
import { Plus } from "src/icons/plus";
import { Trash } from "src/icons/trash";
import {
  deleteFile,
  downloadFile,
  uploadPDFToUserFolder,
} from "src/lib/client/firebase";
import { NewOrder, Sample } from "src/types/order";

interface CollectedSamplesProps {
  order: NewOrder;
  onOrderChanged: (updatedOrder: NewOrder) => void;
}

const readableStatus = (status: string) => {
  return status.replace("-", " ");
};

const getSubmissionSummary = (order: NewOrder) => {
  let submitted = order?.submittedSamples ? order?.submittedSamples.length : 0;
  let requested = order?.orderedSamples ? order?.orderedSamples.length : 0;

  return `${submitted}/${requested}`;
};

export const CollectedSamplesListTable: FC<CollectedSamplesProps> = ({
  order,
  onOrderChanged,
}) => {
  const { sendRequest } = useTypedAuth();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setRef = (element: HTMLInputElement | null, index: number) => {
    fileInputRefs.current[index] = element;
  };

  const handleButtonClick = (index: number) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.click();
    }
  };

  const uploadReport = (
    sample: Sample,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    uploadPDFToUserFolder(
      order.userId,
      `${order.id}/${sample.name}/${file.name}`,
      file,
    ).then((path) => onSampleReportChanged(order, sample, path));
  };

  const onSampleReportChanged = async (
    order: NewOrder,
    sample: Sample,
    reportPath?: string,
  ) => {
    await sendRequest(
      `/api/orders/${order.id}/samples/${sample.name}/report`,
      "PATCH",
      { reportUrl: reportPath },
    ).then(() => {
      if (!order.submittedSamples) {
        throw "Order has no samples.";
      }
      const sampleIndex = order.submittedSamples.findIndex(
        (s) => s.name == sample.name,
      );
      if (sampleIndex == -1) {
        throw "Sample not on order.";
      }

      const updatedSamples = [...order.submittedSamples];
      updatedSamples[sampleIndex] = {
        ...order.submittedSamples[sampleIndex],
        reportUrl: reportPath,
        status: "complete",
      };

      const updatedOrder: NewOrder = {
        ...order,
        submittedSamples: updatedSamples,
      };

      onOrderChanged(updatedOrder);
    });
  };

  const openReport = (reportUrl: string) => {
    window.open(reportUrl, "_blank", "noopener,noreferrer");
  };

  const downloadReport = (reportUrl: string) => {
    downloadFile(reportUrl);
  };

  const deleteReport = (sample: Sample) => {
    if (!sample.reportUrl) {
      return;
    }
    deleteFile(sample.reportUrl).then(() =>
      onSampleReportChanged(order, sample, undefined),
    );
  };

  return (
    <Box sx={{ margin: 1 }}>
      <Typography variant="h6" gutterBottom component="div" sx={{ mb: 4 }}>
        Samples Collected - {getSubmissionSummary(order)}
      </Typography>
      <Table size="small" aria-label="purchases">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Service</TableCell>
            <TableCell>Sample Type</TableCell>
            <TableCell>Host Species</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell>Report</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.submittedSamples?.map((s, index) => (
            <TableRow key={s.name}>
              <TableCell>
                <SampleName name={s.name} />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{s.service}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {s.metadata.sampleType as any as string}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {s.metadata.hostSpecies as any as string}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {s.metadata.notes as any as string}
                </Typography>
              </TableCell>

              <TableCell>
                {!s.reportUrl && (
                  <AdminGuard>
                    <IconButton
                      sx={{ zIndex: 1 }}
                      onClick={() => handleButtonClick(index)}
                    >
                      <Plus />
                    </IconButton>
                    <input
                      type="file"
                      ref={(element) => setRef(element, index)}
                      accept=".html,application/pdf"
                      style={{ display: "none" }}
                      onChange={(event) => uploadReport(s, event)}
                    />
                  </AdminGuard>
                )}
                {s.reportUrl && (
                  <IconButton
                    hidden={!s.reportUrl}
                    aria-label="open report"
                    onClick={() => openReport(s.reportUrl!)}
                  >
                    <DocumentText />
                  </IconButton>
                )}
                {s.reportUrl && (
                  <IconButton
                    hidden={!s.reportUrl}
                    aria-label="download report"
                    onClick={() => downloadReport(s.reportUrl!)}
                  >
                    <Download />
                  </IconButton>
                )}
                {!!s.reportUrl && (
                  <AdminGuard>
                    <IconButton onClick={() => deleteReport(s)} size="small">
                      <Trash />
                    </IconButton>
                  </AdminGuard>
                )}
              </TableCell>
              <TableCell sx={{ pr: 2 }}>
                <SeverityPill color={sampleSeverityMap[s.status] || "warning"}>
                  {readableStatus(s.status)}
                </SeverityPill>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
