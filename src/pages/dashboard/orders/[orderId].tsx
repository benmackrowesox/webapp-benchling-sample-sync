import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import router from "next/router";
import NextLink from "next/link";
import Head from "next/head";
import format from "date-fns/format";
import toast from "react-hot-toast";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Link,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { orderStore as orderStore } from "../../../lib/client/store/orders";
import {
  AdminGuard,
  AuthGuard,
} from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { OrderSummary } from "../../../components/dashboard/order/order-summary";
import { useMounted } from "../../../hooks/use-mounted";
import { Calendar as CalendarIcon } from "../../../icons/calendar";
import { gtm } from "../../../lib/client/gtm";
import { MetadataField, NewOrder } from "../../../types/order";
import { useTypedAuth } from "src/hooks/use-auth";
import { availableMoves } from "src/lib/client/stateMachine";
import LoadingButton from "@mui/lab/LoadingButton";
import { PaperAirplane } from "src/icons/paper-airplane";
import { MetadataEditList } from "src/components/dashboard/order/metadata-edit-list";
import { PageHelpSection } from "src/components/dashboard/page-help-section";
import { sendEmail, EMAILJS_TEMPLATES } from "src/lib/client/emailjs";

const OrderDetails: NextPage = () => {
  const isMounted = useMounted();
  const { user, sendRequest } = useTypedAuth();
  const [order, setOrder] = useState<NewOrder | null>(null);
  const [metadata, setMetadata] = useState<MetadataField[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const addMetadataToOrder = async (newItem: {
    name: string;
    displayName: string;
  }) => {
    if (!order) {
      return;
    }
    const newOrder = {
      ...order,
      metadataFields: [...order.metadataFields, newItem],
    };
    await sendRequest(
      `/api/orders/${order.id}/metadata`,
      "PATCH",
      newOrder.metadataFields,
    );
    setOrder(newOrder);
  };

  const removeMetadataFromOrder = async (item: { name: string }) => {
    if (!order) {
      return order;
    }
    const newOrder = { ...order, metadataFields: [...order.metadataFields] };
    const idx = newOrder.metadataFields.findIndex((f) => f.name == item.name);
    if (idx != -1) {
      newOrder?.metadataFields.splice(idx, 1);
    }
    await sendRequest(
      `/api/orders/${order.id}/metadata`,
      "PATCH",
      newOrder.metadataFields,
    );

    setOrder(newOrder);
  };

  const getOrder = useCallback(async () => {
    try {
      const postId = window.location.pathname.split("/").pop();
      const data = await orderStore.getOrder(user!, postId ?? "");
      const metadata = user?.isAdmin
        ? await sendRequest<void, MetadataField[]>("/api/metadata/all", "GET")
        : [];

      if (isMounted()) {
        setOrder(data);
        setMetadata(metadata);
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

  if (!order) {
    return null;
  }

  const pageHelp = (
    <>
      {`Here, you'll find details of the order. The fields below correspond to the proposal you submitted.
      If there is something that needs changing or if the project doesn't look right then please let us know.`}
      <br />
      {`You'll also notice that the status of your order changes to reflect when the kit has been posted.
      Once you've received it, check back in to let us know by clicking on the button above.`}
      <br />
      {`Once you are ready to start submitting samples, select the sample submission tab.`}
    </>
  );

  return (
    <>
      <Head>
        <title>Order Details | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Box key="ordersLinkBox" sx={{ mb: 4 }}>
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
          <Tabs value={"Order Summary"} sx={{ mb: 3 }}>
            <Tab value={"Order Summary"} label="Order Summary" />
            {order.status == "kit-arrived" && (
              <Tab
                value={"Sample Submission"}
                onClick={() => {
                  const paths = window.location.pathname.split("/");

                  const orderId = paths[paths.length - 1];
                  router.push(`/dashboard/orders/${orderId}/sample-submission`);
                }}
                label="Sample Submission"
              />
            )}
            <Tab
              value={"Order Documents"}
              label="Order Documents"
              onClick={() => {
                const paths = window.location.pathname.split("/");

                const orderId = paths[paths.length - 1];
                router.push(`/dashboard/orders/${orderId}/order-documents`);
              }}
            />
          </Tabs>
          <Container maxWidth="lg">
            <Box key="orderIdBox" sx={{ mb: 4 }}>
              <Grid container justifyContent="space-between" spacing={3}>
                <Grid item>
                  <Typography variant="h3">{order.title}</Typography>
                  <Typography variant="h6">{order.id}</Typography>
                  <Box
                    sx={{
                      alignItems: "center",
                      display: "flex",
                      ml: -1,
                      mt: 1,
                    }}
                  >
                    <Typography
                      color="textSecondary"
                      variant="body2"
                      sx={{ ml: 1 }}
                    >
                      Placed on
                    </Typography>
                    <CalendarIcon
                      color="action"
                      fontSize="small"
                      sx={{ ml: 1 }}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {format(order.createdAt, "dd/MM/yyyy HH:mm")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid key="availableMovesGrid" item sx={{ ml: 2 }}>
                  {order.status &&
                    availableMoves[order.status].map((move, index) => {
                      if (move.admin) {
                        // disabling for one minute per task (requested service) or at least 2 min
                        const disabledUntil =
                          order.createdAt +
                          Math.max(order.requestedServices?.length, 2) *
                            60 *
                            1000;

                        const disableApproveButton =
                          order.status == "reviewing" &&
                          move.newState == "approved" &&
                          disabledUntil > new Date().getTime();

                        return (
                          <AdminGuard key={move.label}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                mb: 2,
                              }}
                            >
                              <LoadingButton
                                variant="outlined"
                                sx={{ ml: 2 }}
                                loading={isLoading}
                                disabled={disableApproveButton}
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    if (
                                      order.status == "reviewing" &&
                                      move.newState == "approved"
                                    ) {
                                      await sendRequest(
                                        `/api/orders/${order.id}/approve`,
                                        "POST",
                                      );
                                      await sendEmail(
                                        EMAILJS_TEMPLATES.ORDER_STATUS_CHANGED,
                                        {
                                          subject: "Order approved",
                                          customer_name: order.customer.name,
                                          customer_email: order.customer.email,
                                          order_id: order.id,
                                          order_status: move.newState,
                                          order_title: order.title,
                                        },
                                      );
                                    } else {
                                      await sendRequest(
                                        `/api/orders/${order.id}/status`,
                                        "PATCH",
                                        { status: move.newState },
                                      );

                                      orderStore.updateOrderStatus(order, {
                                        status: move.newState,
                                      });
                                    }
                                    router.reload();
                                  } catch (e) {
                                    console.error(e);
                                    setLoading(false);
                                    toast.error(
                                      e?.response?.data ??
                                        e?.message ??
                                        "An error occurred.",
                                    );
                                  }
                                }}
                              >
                                {move.label}
                              </LoadingButton>
                              {disableApproveButton && (
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ mt: 2, textAlign: "right" }}
                                >
                                  <strong>Approve order</strong> is cautiously
                                  disabled until <br />
                                  <strong>
                                    {format(disabledUntil, "dd/MM/yyyy HH:mm")}
                                  </strong>{" "}
                                  for Benchling tasks to be ready.
                                </Typography>
                              )}
                            </Box>
                          </AdminGuard>
                        );
                      }
                    })}
                </Grid>
              </Grid>
            </Box>
            {
              <>
                {order.status == "approved" && (
                  <>
                    <Card
                      key="approvedCard"
                      sx={(theme) => ({
                        mb: 2,
                        border: 2,
                        boxShadow: 0,
                        borderColor: theme.palette.success.main,
                      })}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            alignItems: "center",
                            display: "flex",
                          }}
                        >
                          <PaperAirplane
                            color="action"
                            fontSize="small"
                            sx={{ ml: 1 }}
                          />
                          <Typography
                            color="textPrimary"
                            variant="h6"
                            sx={{ ml: 1 }}
                          >
                            Your order has been approved, and a kit will be
                            dispatched shortly.
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </>
                )}

                {order.status == "kit-sent" && (
                  <>
                    <Card
                      sx={(theme) => ({
                        mb: 2,
                        border: 2,
                        boxShadow: 0,
                        borderColor: theme.palette.success.light,
                      })}
                    >
                      <CardContent>
                        <Stack spacing={4}>
                          <Box
                            sx={{
                              alignItems: "center",
                              display: "flex",
                              mt: 1,
                            }}
                          >
                            <PaperAirplane
                              color="action"
                              fontSize="small"
                              sx={{ ml: 1 }}
                            />
                            <Typography
                              color="textPrimary"
                              variant="body2"
                              sx={{ ml: 1 }}
                            >
                              Your kit{" "}
                              {!!order.dispatchedAt
                                ? `was dispatched on ${format(
                                    order.dispatchedAt,
                                    "dd/MM/yyyy",
                                  )}. `
                                : "has been dispatched. "}
                              If you have received your kit, click the Mark
                              Received button below to navigate to the Sample
                              Submission page.
                            </Typography>
                          </Box>
                          <LoadingButton
                            variant="contained"
                            sx={{ ml: 2 }}
                            loading={isLoading}
                            onClick={async () => {
                              try {
                                setLoading(true);
                                await sendRequest(
                                  `/api/orders/${order.id}/status`,
                                  "PATCH",
                                  { status: "kit-arrived" },
                                );
                                orderStore.updateOrderStatus(order, {
                                  status: "kit-arrived",
                                });
                                router.push(
                                  `/dashboard/orders/${order.id}/sample-submission`,
                                );
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            Mark Received
                          </LoadingButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  </>
                )}
                <PageHelpSection>{pageHelp}</PageHelpSection>
              </>
            }
            <OrderSummary key="orderSummary" order={order} />
            <AdminGuard key="metadataEditList">
              <Card sx={{ mt: 2 }}>
                <CardHeader title="Admin - Edit metadata fields" />
                <CardContent>
                  <MetadataEditList
                    metadataFields={order.metadataFields}
                    allMetadataFields={metadata}
                    addToList={(f) => addMetadataToOrder(f)}
                    removeFromList={(f) => removeMetadataFromOrder(f)}
                  />
                </CardContent>
              </Card>
            </AdminGuard>
          </Container>
        </Container>
      </Box>
    </>
  );
};

OrderDetails.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default OrderDetails;
