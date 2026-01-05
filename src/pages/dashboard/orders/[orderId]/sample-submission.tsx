import { Fragment, useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import NextLink from "next/link";
import Head from "next/head";
import {
  Box,
  Container,
  Grid,
  Link,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { orderStore as orderStore } from "../../../../lib/client/store/orders";
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../../hooks/use-mounted";
import { gtm } from "../../../../lib/client/gtm";
import {
  MetadataField,
  NewOrder,
  Sample,
  UnsubmittedSample,
} from "../../../../types/order";

import { useTypedAuth } from "src/hooks/use-auth";
import { SampleSubmissionTableWrapper } from "src/components/dashboard/order/sample-submission-table-wrapper";
import { SampleSubmissionMetadataField } from "src/components/dashboard/order/sample-submission-table";
import { SampleSubmissionSummary } from "src/components/dashboard/order/sample-submission-summary";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { PageHelpSection } from "src/components/dashboard/page-help-section";

const SampleSubmission: NextPage = () => {
  const isMounted = useMounted();
  const { user, sendRequest } = useTypedAuth();
  const router = useRouter();
  const [sampleSubmissionState, setState] = useState<{
    order: NewOrder;
    metadata: MetadataField[];
  } | null>(null);
  const theme = useTheme();

  const mobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const updateSamples = async (
    unsubmittedSamples: UnsubmittedSample[],
    submittedSamples: Sample[],
  ) => {
    const paths = window.location.pathname.split("/");

    const orderId = paths[paths.length - 2];

    const body = user?.isAdmin
      ? {
          unsubmittedSamples: unsubmittedSamples,
          submittedSamples: submittedSamples,
        }
      : {
          unsubmittedSamples: unsubmittedSamples,
        };

    await sendRequest<
      { unsubmittedSamples: UnsubmittedSample[]; submittedSamples?: Sample[] },
      void
    >(`/api/orders/${orderId}/samples`, "PATCH", body);
    orderStore.invalidateCache();
  };

  const submitSamples = async (sampleIds: string[]) => {
    const paths = window.location.pathname.split("/");

    const orderId = paths[paths.length - 2];

    const body = {
      sampleIds: sampleIds,
    };

    await sendRequest<{ sampleIds: string[] }, void>(
      `/api/orders/${orderId}/samples/submit`,
      "POST",
      body,
    );
    orderStore.invalidateCache();

    toast.success("Sample(s) submitted");
    router.push(`/dashboard/orders`);
  };

  const getOrder = useCallback(async () => {
    try {
      const paths = window.location.pathname.split("/");

      const orderId = paths[paths.length - 2];
      const order = await orderStore.getOrder(user!, orderId ?? "");
      if (!order) {
        throw "Order not found.";
      }

      if (order.status != "kit-arrived") {
        router.push(`/dashboard/orders/${orderId}`);
        return;
      } else {
        const metadata = await sendRequest<void, MetadataField[]>(
          "/api/metadata/all",
          "GET",
        );

        if (isMounted()) {
          setState({ order, metadata });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      getOrder();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (!sampleSubmissionState) {
    return null;
  }

  const buildOrderMetadata = (
    orderMetadataFields: { name: string; displayName: string }[],
    metadata: MetadataField[],
  ): SampleSubmissionMetadataField[] =>
    metadata.map((m) => {
      const mIndex = orderMetadataFields.findIndex((x) => x.name == m.name);
      const field: SampleSubmissionMetadataField = {
        ...m,
        displayOnOrder: mIndex != -1,
        displayIndex: mIndex,
      };
      return field;
    });

  return (
    <>
      <Head>
        <title>Sample Submission | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <Box sx={{ mb: 4 }}>
            <NextLink href="/dashboard/orders" passHref legacyBehavior>
              <Link
                color="textPrimary"
                component="a"
                sx={{
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Orders</Typography>
              </Link>
            </NextLink>
          </Box>
          <Tabs value={"Sample Submission"} sx={{ mb: 3 }}>
            <Tab
              value={"Order Summary"}
              onClick={() => {
                const paths = window.location.pathname.split("/");

                const orderId = paths[paths.length - 2];
                router.push(`/dashboard/orders/${orderId}/`);
              }}
              label="Order Summary"
            />
            <Tab value={"Sample Submission"} label="Sample Submission" />
            <Tab
              value={"Order Documents"}
              onClick={() => {
                const paths = window.location.pathname.split("/");

                const orderId = paths[paths.length - 2];
                router.push(`/dashboard/orders/${orderId}/order-documents`);
              }}
              label="Order Documents"
            />
          </Tabs>
          <Box sx={{ mb: 4, ml: 0 }}>
            <Stack spacing={3}>
              <Grid item>
                <Typography variant="h4">Sample Submission</Typography>
              </Grid>
              <PageHelpSection>
                {mobileDevice ? (
                  <>
                    <p>
                      {`Once you've collected your samples and stored them appropriately, you are
                                  ready to submit them within the corresponding order.`}
                      <br />
                      {`The table below allows you to add each sample one row at a time. Double click
                                  on each entry column to find either multiple choice, text or number fields.`}
                      <br />
                    </p>
                    <p>
                      {`The ID numbers selectable in the Sample field correspond with the labels you have received.
                                  Please ensure you select the correct ID numbers to avoid errors in processing or inaccurate output data.`}
                      <br />
                      {`When you have filled out all relevant entry fields, click Submit and you're ready to enter the next sample.`}
                    </p>

                    <p>
                      {`Should you have more than one sample with the same data for a particular field, start by populating the first sample.
                     Then, use the Autofill options for subsequent samples to populate data from the previous sample.`}
                    </p>
                    {`Be sure to save details for later if you haven't yet filled out all the required information.`}
                  </>
                ) : (
                  <>
                    <p>
                      {`Once you've collected your samples and stored them appropriately, you are
                  ready to submit them within the corresponding order.`}
                      <br />
                      {`The table below allows you to add each sample one row at a time. Double click
                  on each entry column to find either multiple choice, text or number fields.`}
                      <br />
                    </p>
                    <p>
                      {`The ID numbers selectable in the Sample field correspond with the labels you have received.
                  Please ensure you select the correct ID numbers to avoid errors in processing or inaccurate output data.`}
                      <br />
                      {`When you have filled out all relevant entry fields, click Submit and you're ready to enter the next sample.
                  Should you have more than one sample with the same data for a particular field, you may select multiple rows,
                  and use the Bulk update option below.`}
                    </p>
                    {`Be sure to save details for later if you haven't yet filled out all the required information.`}
                  </>
                )}
              </PageHelpSection>
              <SampleSubmissionSummary
                orderedSamples={sampleSubmissionState.order.orderedSamples!}
                submittedSamples={sampleSubmissionState.order.submittedSamples}
              />
              <Grid item>
                <Typography variant="h5">
                  {sampleSubmissionState.order.id}
                </Typography>
              </Grid>

              <Container maxWidth={false} sx={{ pl: 0 }}>
                <SampleSubmissionTableWrapper
                  key="sst"
                  unsubmittedSamples={
                    sampleSubmissionState.order.unsubmittedSamples
                  }
                  submittedSamples={
                    sampleSubmissionState.order.submittedSamples
                  }
                  orderedSamples={sampleSubmissionState.order.orderedSamples!}
                  metadata={buildOrderMetadata(
                    sampleSubmissionState.order.metadataFields,
                    sampleSubmissionState.metadata,
                  )}
                  isAdmin={user?.isAdmin ?? false}
                  saveUnsubmittedSamples={updateSamples}
                  submitSamples={submitSamples}
                  isMobile={mobileDevice}
                />
              </Container>
            </Stack>
          </Box>

          <Box></Box>
        </Container>
      </Box>
    </>
  );
};

SampleSubmission.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default SampleSubmission;
