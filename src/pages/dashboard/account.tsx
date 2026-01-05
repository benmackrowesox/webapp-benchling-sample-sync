import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box, Container, Divider, Tab, Tabs, Typography } from "@mui/material";
import { AuthGuard } from "../../components/authentication/auth-guard";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { AccountGeneralSettings } from "../../components/dashboard/account/account-general-settings";
import { gtm } from "../../lib/client/gtm";
import { ChangePasswordSettings } from "src/components/dashboard/account/change-password-settings";
import { VerifyEmailSettings } from "src/components/dashboard/account/verify-email-settings";
import { UserAccountDocuments } from "src/components/dashboard/account/user-account-documents";
import { PageHelpSection } from "src/components/dashboard/page-help-section";
import { useTypedAuth } from "src/hooks/use-auth";

const Account: NextPage = () => {
  const [currentTab, setCurrentTab] = useState<string>("general");
  const { user } = useTypedAuth();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  const tabs = user?.emailVerified
    ? [
        { label: "General", value: "general" },
        { label: "Change Password", value: "changePassword" },
        { label: "Documents", value: "documents" },
      ]
    : [
        { label: "General", value: "general" },
        { label: "Change Password", value: "changePassword" },
        { label: "Verify Email", value: "verifyEmail" },
        { label: "Documents", value: "documents" },
      ];

  return (
    <>
      <Head>
        <title>Account | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4">Account</Typography>
          {!user?.emailVerified && (
            <PageHelpSection>
              <span>
                Your account is not yet verified. Please click the verification
                link sent to the email address you used when registering. If you
                have not received this link, you may resend it from the Verify
                Email tab below.
              </span>
            </PageHelpSection>
          )}
          <Tabs
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            textColor="primary"
            value={currentTab}
            variant="scrollable"
            sx={{ mt: 3 }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
          <Divider sx={{ mb: 3 }} />
          {currentTab === "general" && <AccountGeneralSettings />}
          {currentTab === "changePassword" && <ChangePasswordSettings />}
          {currentTab === "verifyEmail" && <VerifyEmailSettings />}
          {currentTab === "documents" && <UserAccountDocuments />}
        </Container>
      </Box>
    </>
  );
};

Account.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default Account;
