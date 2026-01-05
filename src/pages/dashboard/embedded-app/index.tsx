
import React, { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box, Container, Typography } from "@mui/material";

import { AdminOrApprovedGuard } from "src/components/authentication/auth-guard";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { gtm } from "src/lib/client/gtm";

const EmbeddedApp: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const iframeSrc = process.env.NEXT_PUBLIC_EMBEDDED_APP_URL || "about:blank";

  return (
    <>
      <Head>
        <title>Embedded App | Dashboard</title>
      </Head>
      <Typography sx={{ m: 5 }} variant="h4">
        Embedded App
      </Typography>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ height: "80vh", border: "1px solid #e0e0e0" }}>
            <iframe
              title="Embedded App"
              src={iframeSrc}
              style={{ width: "100%", height: "100%", border: 0 }}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

EmbeddedApp.getLayout = (page) => (
  <AdminOrApprovedGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminOrApprovedGuard>
);

export default EmbeddedApp;
