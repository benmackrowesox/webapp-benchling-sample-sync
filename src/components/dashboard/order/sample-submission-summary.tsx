import { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material";
import { Sample, OrderedSample } from "src/types/order";

import { SERVICE_COLOURS } from "src/components/dashboard/order/sample-name";

interface SampleSubmissionSummaryProps {
  submittedSamples?: Sample[];
  orderedSamples: OrderedSample[];
}

export const SampleSubmissionSummary: React.FC<
  SampleSubmissionSummaryProps
> = ({ orderedSamples, submittedSamples }) => {
  const summary = useMemo(() => {
    let summary: { [key: string]: { submitted: number; ordered: number } } = {};

    orderedSamples.forEach((orderedSample) => {
      summary[orderedSample.service] = {
        submitted: 0,
        ordered: (summary[orderedSample.service]?.ordered ?? 0) + 1,
      };
    });

    submittedSamples?.forEach(
      (submittedSample) => summary[submittedSample.service].submitted++,
    );
    return summary;
  }, [orderedSamples, submittedSamples]);

  if (!summary) {
    return <div />;
  }

  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardHeader title="Submission Summary" />
      <Divider />

      <CardContent>
        {Object.keys(summary).map((service) => (
          <Box
            key={service}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              borderLeft: `6px solid ${SERVICE_COLOURS[service]}`,
              borderRadius: "1px",
              pl: "3px",
              marginBottom: "6px",
            }}
          >
            <Typography variant="subtitle2" sx={{ paddingRight: 1 }}>
              {service}:
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {summary[service].submitted}/{summary[service].ordered}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};
