import type { FC } from "react";
import Link from "next/link";
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

import { SeverityPill } from "../../severity-pill";
import { sampleSeverityMap } from "../order/order-list-table";
import React from "react";
import { DocumentText } from "src/icons/document-text";
import { Download } from "src/icons/download";
import { downloadFile } from "src/lib/client/firebase";

import { BasicSample } from "src/types/order";
import { SampleName } from "../order/sample-name";

interface SampleListTableProps {
  title: string;
  samples: BasicSample[];
  showOrderLink: boolean;
}

const readableStatus = (status: string) => {
  return status?.replace("-", " ");
};
const displayOrderLink = (sample: BasicSample) => {
  const hasTitle = sample.orderTitle?.trim().length > 0;
  return hasTitle ? `${sample.orderId} - ${sample.orderTitle}` : sample.orderId;
};

const getSampleType = (sample: BasicSample) => {
  const metadata = sample.metadata ?? {};
  const sampleType = metadata.sampleType as any as string;

  return sampleType;
};

const getHostSpecies = (sample: BasicSample) => {
  const metadata = sample.metadata ?? {};
  const hostSpecies = metadata.hostSpecies as any as string;

  return hostSpecies;
};

const getNotes = (sample: BasicSample) => {
  const metadata = sample.metadata ?? {};
  const notes = metadata.notes as any as string;

  return notes;
};

export const SampleListTable: FC<SampleListTableProps> = (props) => {
  const { title, samples, showOrderLink } = props;

  const openReport = (reportUrl: string) => {
    window.open(reportUrl, "_blank", "noopener,noreferrer");
  };

  const downloadReport = (reportUrl: string) => {
    downloadFile(reportUrl);
  };

  if (!samples) {
    return null;
  }

  return (
    <Box sx={{ margin: 1 }}>
      <Typography
        sx={{
          mb: 4,
        }}
        variant="h6"
        gutterBottom
        component="div"
      >
        {title}
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
            {showOrderLink && <TableCell>Order</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {samples.map((sample) => (
            <TableRow key={sample.name}>
              <TableCell>
                <SampleName name={sample.name} />
              </TableCell>
              <TableCell>
                <Typography>{sample.service}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{getSampleType(sample)}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{getHostSpecies(sample)}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{getNotes(sample)}</Typography>
              </TableCell>
              <TableCell
                sx={{
                  input: { display: "none" },
                  ".custom-file-upload": {
                    display: "inline-block",
                    cursor: "pointer",
                  },
                }}
              >
                {sample.reportUrl && (
                  <IconButton
                    hidden={!sample.reportUrl}
                    aria-label="open report"
                    onClick={() => openReport(sample.reportUrl!)}
                  >
                    <DocumentText />
                  </IconButton>
                )}
                {sample.reportUrl && (
                  <IconButton
                    hidden={!sample.reportUrl}
                    aria-label="download report"
                    onClick={() => downloadReport(sample.reportUrl!)}
                  >
                    <Download />
                  </IconButton>
                )}
              </TableCell>
              <TableCell sx={{ pr: 2 }}>
                <SeverityPill
                  color={
                    sample.status ? sampleSeverityMap[sample.status] : "warning"
                  }
                >
                  {readableStatus(sample.status ?? "Awaiting")}
                </SeverityPill>
              </TableCell>

              {showOrderLink && sample.orderId && (
                <TableCell
                  sx={{
                    pr: 2,
                  }}
                >
                  <Link href={`/dashboard/orders/${sample.orderId}`}>
                    {displayOrderLink(sample)}
                  </Link>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
