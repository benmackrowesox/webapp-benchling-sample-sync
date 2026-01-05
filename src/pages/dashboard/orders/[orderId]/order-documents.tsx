import { FC, useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import router from "next/router";
import NextLink from "next/link";
import Head from "next/head";
import {
  Box,
  Card,
  CardContent,
  Container,
  Link,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useTypedAuth } from "src/hooks/use-auth";
import { useMounted } from "src/hooks/use-mounted";

import { AuthGuard } from "src/components/authentication/auth-guard";
import { CollectedSamplesListTable } from "src/components/dashboard/sample/collected-samples-list-table";
import { FileManagement } from "src/components/dashboard/account/file-management";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { PageHelpSection } from "src/components/dashboard/page-help-section";

import { sendEmail, EMAILJS_TEMPLATES } from "src/lib/client/emailjs";
import { gtm } from "src/lib/client/gtm";
import { USER_FOLDERS } from "src/lib/client/firebase";
import { orderStore as orderStore } from "src/lib/client/store/orders";

import { NewOrder } from "src/types/order";

import "react-phone-input-2/lib/style.css";

const OrderDocuments: NextPage = () => {
  const isMounted = useMounted();
  const { user, sendRequest } = useTypedAuth();
  const [order, setOrder] = useState<NewOrder | null>(null);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getOrder = useCallback(async () => {
    try {
      const pathChunks = window.location.pathname.split("/");
      const orderId = pathChunks[pathChunks.length - 2];
      const data = await orderStore.getOrder(user!, orderId ?? "");

      if (isMounted()) {
        setOrder(data);
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

  const onOrderChange = (newOrder: NewOrder) => {
    orderStore.updateOrderStatus(newOrder, {});
    // usually query is done on backend with indexing solutions
    setOrder(newOrder);
  };

  if (!order) {
    return <div />;
  }

  const onReportUploaded = async (filename: string, path: string) => {
    if (!order || !path) {
      return;
    }

    const newOrder = {
      ...order,
      orderReportUrls: order.orderReports ?? [],
    };
    const newReport = {
      downloadUrl: path,
      filename: filename,
    };
    newOrder.orderReportUrls.push(newReport);

    await sendRequest(`/api/orders/${order.id}/reports`, "POST", newReport);

    await sendEmail(EMAILJS_TEMPLATES.ORDER_STATUS_CHANGED, {
      subject: "Report ready for order",
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      order_id: order.id,
      order_status: "new report uploaded",
      order_title: order.title,
    });
  };

  const onReportRemove = async (filename: string) => {
    const newOrder = {
      ...order,
    };
    const idx = newOrder.orderReports?.findIndex((f) => f.filename == filename);
    if (newOrder?.orderReports && idx != undefined && idx != -1) {
      newOrder?.orderReports.splice(idx, 1);
    }
    await sendRequest(
      `/api/orders/${order.id}/reports/?filename=${filename}`,
      "DELETE",
    );
  };

  const LinkWithId: FC<{ text: string; id: string }> = ({ text, id }) => {
    return (
      <span>
        - <Link href={`#${id}`}>{text}</Link>
        <br />
      </span>
    );
  };

  const pageHelp = (
    <>
      {`All documents related to the order will be displayed here.`}
      <br />
      <LinkWithId text="Order reports" id="order-reports" />
      <LinkWithId
        text="Individual sample reports"
        id="collected-sample-reports"
      />
      <LinkWithId
        text="Files relevant for this order"
        id="order-additional-documents"
      />
      <LinkWithId text="Financial documents" id="financial-documents" />
      <LinkWithId text="Legal documents" id="legal-documents" />
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
          <Tabs value={"Order Documents"} sx={{ mb: 3 }}>
            <Tab
              value={"Order Summary"}
              onClick={() => {
                const paths = window.location.pathname.split("/");

                const orderId = paths[paths.length - 2];
                router.push(`/dashboard/orders/${orderId}/`);
              }}
              label="Order Summary"
            />
            {order.status == "kit-arrived" && (
              <Tab
                value={"Sample Submission"}
                onClick={() => {
                  const paths = window.location.pathname.split("/");

                  const orderId = paths[paths.length - 2];
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

                const orderId = paths[paths.length - 2];
                router.push(`/dashboard/orders/${orderId}/order-documents`);
              }}
            />
          </Tabs>
          <Container maxWidth="lg">
            <Box key="orderIdBox" sx={{ mb: 4 }}>
              <Typography variant="h4">{order.title}</Typography>
              <Typography variant="body2">{order.id}</Typography>
            </Box>

            <PageHelpSection>{pageHelp}</PageHelpSection>

            <div id="order-reports" />
            <FileManagement
              viewOnly
              userId={order.userId}
              title="Order reports"
              folderNames={[
                USER_FOLDERS.ORDER_REPORTS(order.id),
                USER_FOLDERS.OLD_ORDER_REPORTS(order.id),
              ]}
              helpSection={
                <Typography variant="body2">
                  Includes order summary reports or sample reports.
                </Typography>
              }
              onFileUploaded={onReportUploaded}
              onFileRemoved={onReportRemove}
            />
            <div id="collected-sample-reports" />
            <Box sx={{ mt: 4 }}>
              <Card>
                <CardContent>
                  <CollectedSamplesListTable
                    order={order}
                    onOrderChanged={onOrderChange}
                  />
                </CardContent>
              </Card>
              <div id="order-additional-documents" />
            </Box>
            <FileManagement
              userId={order.userId}
              title="Order additional files"
              folderNames={[
                USER_FOLDERS.ORDER_ADDITIONAL_INFORMATION(order.id),
              ]}
              helpSection={
                <Typography variant="body2">
                  Add any relevant files for this order, for example: sample
                  information, environment readings or additional metrics.
                </Typography>
              }
            />
            <div id="financial-documents" />
            <FileManagement
              viewOnly
              userId={order.userId}
              title="Financial documents"
              folderNames={[USER_FOLDERS.ORDER_FINANCIAL_DOCUMENTS(order.id)]}
              helpSection={
                <Typography variant="body2">
                  Includes financial documents like quotes, invoices or
                  receipts.
                </Typography>
              }
            />
            <div id="legal-documents" />
            <Box id="legal-documents">
              <FileManagement
                viewOnly
                userId={order.userId}
                title="Legal documents"
                folderNames={[USER_FOLDERS.ORDER_LEGAL_DOCUMENTS(order.id)]}
                helpSection={
                  <Typography variant="body2">
                    Includes legal documents like statements of work, contract
                    or non-disclosure agreements.
                  </Typography>
                }
              />
            </Box>
          </Container>
        </Container>
      </Box>
    </>
  );
};

OrderDocuments.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default OrderDocuments;
