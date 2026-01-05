import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import {
  ApprovedUserGuard,
  AuthGuard,
} from "../../components/authentication/auth-guard";

import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { SampleListTable } from "src/components/dashboard/sample/sample-list-table";

import { gtm } from "../../lib/client/gtm";
import { useRouter } from "next/router";
import { useTypedAuth } from "src/hooks/use-auth";
import React from "react";
import toast from "react-hot-toast";
import { useTheme } from "@mui/system";
import { DashboardTile } from "src/components/dashboard/dashboard-tile";
import { Plus } from "src/icons/plus";
import { PageHelpSection } from "src/components/dashboard/page-help-section";
import { NewOrder, BasicSample } from "src/types/order";

interface DashboardState {
  friendlyName: string;
  tileData: Record<string, any>;
  orders: NewOrder[];
}

const filterSamplesByStatus = (orders: NewOrder[], sampleStatus: string) => {
  if (!orders) {
    return [];
  }

  let samples = orders.map((order) =>
    getSamplesWithStatus(order, sampleStatus),
  );
  return samples.flat();
};

const getSamplesWithStatus = (order: NewOrder, sampleStatus: string) => {
  const submittedSamples = order.submittedSamples ?? [];
  const submittedSampleNames = submittedSamples.map(
    (submittedSample) => submittedSample.name,
  );
  const orderedSamples = order.orderedSamples ?? [];

  const filteredSamples =
    sampleStatus !== "awaiting"
      ? submittedSamples.filter((s) => s.status === sampleStatus)
      : orderedSamples
          .filter(
            (orderedSample) =>
              !submittedSampleNames.includes(orderedSample.name),
          )
          .map((orderedSample) => ({
            ...orderedSample,
          }));

  const samplesWithOrder: BasicSample[] = filteredSamples.map(
    (filteredSample) => ({
      ...filteredSample,
      orderId: order.id,
      orderTitle: order.title,
    }),
  );

  return samplesWithOrder;
};

const Overview: NextPage = () => {
  const { user, sendRequest } = useTypedAuth();
  const theme = useTheme();
  const router = useRouter();
  const [state, setState] = React.useState<DashboardState>();
  const [selectedSampleTile, setSelectedSampleTile] = React.useState<{
    title: string;
    sampleStatus: string;
  }>({ title: "", sampleStatus: "" });

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const fetchDashboardDetails = async (userId: string) => {
    const dashboardDetails = await sendRequest<void, DashboardState>(
      `/api/users/${userId}/dashboard`,
      "GET",
    );
    setState(dashboardDetails);
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    fetchDashboardDetails(user?.id).catch((error) => {
      toast.error(error?.message);
    });
  }, [user?.id]);

  const displayedSamples = React.useMemo(
    () =>
      selectedSampleTile && state?.orders
        ? filterSamplesByStatus(state?.orders, selectedSampleTile.sampleStatus)
        : [],
    [state?.orders, selectedSampleTile],
  );

  const isSampleTileSelected = React.useMemo(
    () => selectedSampleTile?.sampleStatus !== "",
    [selectedSampleTile.sampleStatus],
  );

  const onClickSampleTile = (title: string, sampleStatus: string) => {
    if (sampleStatus === selectedSampleTile.sampleStatus) {
      setSelectedSampleTile({ title: "", sampleStatus: "" });
    } else {
      setSelectedSampleTile({ title, sampleStatus });
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              flexWrap: "wrap-reverse",
            }}
          >
            {state?.friendlyName && (
              <Typography variant="h4" sx={{ mt: 2 }}>
                Hello, {state.friendlyName}
              </Typography>
            )}
            <Stack alignSelf="start" direction="row" spacing={2}>
              <Button
                variant="contained"
                sx={{ p: 1, px: 2, borderRadius: "5px" }}
              >
                Detect<span style={{ color: "gold" }}>.</span>
              </Button>
              <Button
                disabled
                variant="contained"
                sx={{ p: 1, px: 2, borderRadius: "5px" }}
              >
                Predict<span style={{ color: "gold" }}>.</span>
              </Button>
              <Button
                disabled
                variant="contained"
                sx={{ p: 1, px: 2, borderRadius: "5px" }}
              >
                Prevent<span style={{ color: "gold" }}>.</span>
              </Button>
            </Stack>
          </Box>

          <ApprovedUserGuard
            guardFailedChildren={
              <PageHelpSection>
                {!user?.emailVerified && (
                  <>
                    {`Your account is not yet verified. Please click the
                    verification link sent to the email address you used when
                    registering. If you have not received this link, you may
                    resend it from the Accounts tab.`}
                    <br />
                  </>
                )}
                {!user?.isApproved &&
                  `Once your account is approved, you will be able to create order requests, submit
                sample information, and view the status of existing orders from
                here.`}
              </PageHelpSection>
            }
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                mt: 5,
              }}
            >
              <DashboardTile
                text="New Order"
                onClick={() => router.push("/dashboard/orders/request")}
                borderColour="lightGray"
                isSelected={false}
              >
                <Plus />
              </DashboardTile>
            </Box>
            <h2>Samples</h2>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <DashboardTile
                text="Awaiting Collection"
                borderColour={theme.palette.warning.main}
                onClick={() =>
                  onClickSampleTile("Samples awaiting Collection", "awaiting")
                }
                isSelected={selectedSampleTile.sampleStatus === "awaiting"}
              >
                {state?.tileData.reviewing}
              </DashboardTile>
              <DashboardTile
                text="Returned to Esox"
                borderColour={theme.palette.error.main}
                onClick={() =>
                  onClickSampleTile(
                    "Samples returned to Esox",
                    "sample-returned",
                  )
                }
                isSelected={
                  selectedSampleTile.sampleStatus === "sample-returned"
                }
              >
                {state?.tileData.returned}
              </DashboardTile>
              <DashboardTile
                text="Processing in the Lab"
                borderColour={theme.palette.info.main}
                onClick={() =>
                  onClickSampleTile(
                    "Samples processing in the Lab",
                    "processing",
                  )
                }
                isSelected={selectedSampleTile.sampleStatus === "processing"}
              >
                {state?.tileData.processing}
              </DashboardTile>
              <DashboardTile
                text="Completed Reports"
                borderColour={theme.palette.success.main}
                onClick={() =>
                  onClickSampleTile(
                    "Samples with completed reports",
                    "complete",
                  )
                }
                isSelected={selectedSampleTile.sampleStatus === "complete"}
              >
                {state?.tileData.complete}
              </DashboardTile>
            </Box>

            {isSampleTileSelected && (
              <Card
                sx={{
                  mt: 5,
                }}
              >
                <CardContent>
                  <SampleListTable
                    title={selectedSampleTile.title}
                    samples={displayedSamples}
                    showOrderLink
                  />
                </CardContent>
              </Card>
            )}
          </ApprovedUserGuard>
        </Container>
      </Box>
    </>
  );
};

Overview.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default Overview;
