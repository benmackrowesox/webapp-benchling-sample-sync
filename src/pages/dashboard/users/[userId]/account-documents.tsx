import type { NextPage } from "next";
import { Box, Container, Typography } from "@mui/material";
import { useRouter } from "next/router";

import { USER_FOLDERS } from "src/lib/client/firebase";
import { FileManagement } from "src/components/dashboard/account/file-management";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { AdminGuard } from "src/components/authentication/auth-guard";
import { UserSelect } from "src/components/dashboard/user/user-select";

import "react-phone-input-2/lib/style.css";

const AccountDocuments: NextPage = () => {
  const router = useRouter();

  const paths = window.location.pathname.split("/");
  const userId = paths[paths.length - 2];

  const onChangeUser = (newUserId: string) => {
    if (newUserId !== userId) {
      router.push({
        pathname: `/dashboard/users/${newUserId}/account-documents`,
      });
    }
  };

  return (
    <AdminGuard>
      <Typography sx={{ m: 5 }} variant="h4">
        Client account files
      </Typography>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <UserSelect userId={userId} onSelectUser={onChangeUser} />
          <FileManagement
            userId={userId}
            title="Agreements and account documents"
            folderNames={[USER_FOLDERS.ACCOUNT_DOCUMENTS]}
            helpSection={
              <>
                <span>
                  Keep all your important documents in one place. Upload
                  agreements, contracts, and other relevant files to your
                  account for easy access and management.
                </span>
                <Typography variant="body2" mt={2} color="primary">
                  <strong>NOTE!</strong> Deleting files will permanently remove
                  them from Firebase Storage.
                </Typography>
              </>
            }
          />
        </Container>
      </Box>
    </AdminGuard>
  );
};

AccountDocuments.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default AccountDocuments;
