import type { FC } from "react";
import { format } from "date-fns";
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { SeverityPill } from "../../severity-pill";
import { OrderRowProps, orderSeverityMap } from "./order-list-table";
import { CollectedSamplesListTable } from "src/components/dashboard/sample/collected-samples-list-table";
import React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { NewOrder } from "src/types/order";

const SampleDisplay: FC<{ order: NewOrder }> = (props) => {
  const theme = useTheme();
  const hasKitArrived = props.order.status == "kit-arrived";
  const totalSampleCount =
    props.order.orderedSamples?.length ??
    props.order.requestedServices
      ?.map((x) => x.numberOfSamples)
      .reduce((x, y) => x + y, 0);

  const submittedSamples = props.order.submittedSamples ?? [];
  const returnedSamples = submittedSamples.filter(
    (s) => s.status == "sample-returned",
  ).length;
  const processingSamples = submittedSamples.filter(
    (s) => s.status == "processing",
  ).length;
  const completeSamples = submittedSamples.filter(
    (s) => s.status == "complete",
  ).length;

  const unsubmittedSampleCount =
    totalSampleCount - returnedSamples - processingSamples - completeSamples;

  const processingColour = theme.palette.info.main;
  const returnedColour = theme.palette.error.main;
  const unsubmittedColour = theme.palette.warning.main;
  const completeColour = theme.palette.success.main;

  return (
    <Box
      sx={{
        p: 0,
        m: 0,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
      }}
    >
      {!hasKitArrived ? (
        <Typography variant="h6" align="center">
          {totalSampleCount}
        </Typography>
      ) : (
        <>
          <Typography variant="h6" display="inline">
            {totalSampleCount}
          </Typography>
          <Box>
            {"("}
            <Typography
              variant="body1"
              display="inline"
              color={unsubmittedColour}
            >
              {unsubmittedSampleCount}
            </Typography>
            {"|"}
            <Typography variant="body1" display="inline" color={returnedColour}>
              {returnedSamples}
            </Typography>
            {"|"}
            <Typography
              variant="body1"
              display="inline"
              color={processingColour}
            >
              {processingSamples}
            </Typography>
            {"|"}
            <Typography variant="body1" display="inline" color={completeColour}>
              {completeSamples}
            </Typography>
            {")"}
          </Box>
        </>
      )}
    </Box>
  );
};

export const OrderRow: FC<OrderRowProps> = (props) => {
  const { order, onOpenDrawer, onOrderChanged, theme, user, ...other } = props;
  const [open, setOpen] = React.useState(false);

  const readableStatus = (status: string) => {
    return status.replace("-", " ");
  };

  const numberOfSubmittedSamples = order.submittedSamples?.length ?? 0;

  return (
    <>
      <TableRow
        hover
        key={order.id}
        onClick={() =>
          onOpenDrawer?.(
            order.id,
            order.status,
            order.submittedSamples?.length == order.orderedSamples?.length,
          )
        }
        sx={{ cursor: "pointer" }}
      >
        <TableCell sx={{ p: 0, ml: 0, mr: 0 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            disabled={numberOfSubmittedSamples === 0}
            onClick={(x) => {
              setOpen(!open);
              x.stopPropagation();
            }}
          >
            {numberOfSubmittedSamples < 1 ? (
              <Box sx={{ width: 24 }} />
            ) : open ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            p: 1,
            pl: "1px",
          }}
        >
          <Box
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "neutral.800" : "neutral.200",
              borderRadius: 2,
              py: 1,
              textAlign: "center",
              width: "40px",
            }}
          >
            <Typography align="center" variant="subtitle2">
              {format(order.createdAt, "LLL").toUpperCase()}
            </Typography>
            <Typography align="center" variant="h6">
              {format(order.createdAt, "d")}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ p: 0, pr: 2 }}>
          <Box sx={{ p: 0, pt: 1, pb: 1, pl: 1 }}>
            <Typography
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              variant="subtitle2"
            >
              {order.id}
            </Typography>
            {user?.isAdmin && (
              <Box component={"span"}>
                <Typography variant="subtitle2" color="primary" sx={{ pb: 2 }}>
                  {order.customer.email}
                </Typography>
                <Typography variant="subtitle2">
                  <strong>{order.customer.name}</strong>
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {`(${order.customer.company} - ${order.customer.role})`}
                </Typography>
              </Box>
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ p: 1 }}>
          <Box sx={{ p: 0 }}>
            <Typography
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              variant="subtitle2"
            >
              {order.title}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ p: 1 }}>
          <Typography
            sx={{
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
            variant="subtitle2"
          >
            {order.proposal}
          </Typography>
        </TableCell>

        <TableCell align="right" sx={{ p: 0 }}>
          <SampleDisplay order={order} />
        </TableCell>
        <TableCell sx={{ p: 0, pr: 1 }} align="right">
          <SeverityPill color={orderSeverityMap[order.status] || "warning"}>
            {readableStatus(order.status)}
          </SeverityPill>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{ mt: 3, mb: 2 }}
          >
            <CollectedSamplesListTable
              order={order}
              onOrderChanged={onOrderChanged}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
