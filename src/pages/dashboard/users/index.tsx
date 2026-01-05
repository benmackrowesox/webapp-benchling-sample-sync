import { useCallback, useEffect, useRef } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";

import { AdminGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { useMounted } from "../../../hooks/use-mounted";
import { gtm } from "../../../lib/client/gtm";
import { useRouter } from "next/router";
import { useAuth } from "src/hooks/use-auth";
import React from "react";

interface UserSummary {
  id: string;
  name: string;
  email: string;
  dateRegistered: number;
  company: string;
  role: string;
  contactNo?: string;
  isAdmin: boolean;
  awaitingApproval: boolean;
  address: string;
  numberOfOrders: number;
}

const AllUsers: NextPage = () => {
  const isMounted = useMounted();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { user, sendRequest } = useAuth();
  const [users, setState] = React.useState<UserSummary[]>([]);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const data = await sendRequest("/api/users/users", "GET");
      if (!data) {
        return;
      }

      if (isMounted()) {
        setState(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, sendRequest]);

  useEffect(
    () => {
      getUsers();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <Head>
        <title>Admin: Users | Esox Biologics</title>
      </Head>
      <Typography sx={{ m: 5, mb: 0 }} variant="h4">
        Registered clients
      </Typography>
      <Typography sx={{ ml: 5, mt: 1, mb: 5 }} variant="body2">
        Total clients: {users.length} (including{" "}
        {users.filter((aUser) => aUser.isAdmin).length} admin)
      </Typography>
      <Box
        component="main"
        ref={rootRef}
        sx={{
          backgroundColor: "background.paper",
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Contact No.</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Awaiting approval</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Admin actions</TableCell>
                <TableCell>Orders</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((aUser) => (
                <TableRow key={aUser.id}>
                  <TableCell>{aUser.dateRegistered}</TableCell>
                  <TableCell>
                    <Typography
                      color={aUser.id === user.id ? "primary" : "inherit"}
                    >
                      {aUser.name}
                    </Typography>
                    <Typography
                      color={
                        aUser.email
                          ? aUser.id === user.id
                            ? "primary"
                            : "inherit"
                          : "error"
                      }
                      variant="subtitle2"
                    >
                      {aUser.email ?? "no user account"}
                    </Typography>
                  </TableCell>
                  <TableCell>{aUser.company}</TableCell>
                  <TableCell>{aUser.role}</TableCell>
                  <TableCell>{aUser.contactNo}</TableCell>
                  <TableCell sx={{ width: 200 }}>{aUser.address}</TableCell>

                  <TableCell>
                    {aUser.awaitingApproval && (
                      <Button
                        color="error"
                        onClick={() => router.push(`/dashboard/approve-users`)}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {aUser.isAdmin && <DoneIcon color="primary" />}
                  </TableCell>
                  <TableCell sx={{ width: 220, p: 0 }}>
                    <Button
                      onClick={() =>
                        router.push({
                          pathname: "/dashboard/orders/request",
                          query: { userId: aUser.id },
                        })
                      }
                    >
                      {/*<AddIcon
                        color="primary"
                        fontSize="small"
                        sx={{ pr: 1 }}
                      />*/}
                      New order
                    </Button>
                    <Button
                      onClick={() =>
                        router.push({
                          pathname: `/dashboard/users/${aUser.id}/account-documents`,
                        })
                      }
                    >
                      Upload file
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Typography>{aUser.numberOfOrders}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

AllUsers.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default AllUsers;
