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
  dateRegistered: number;
  company: string;
  role: string;
  contactNo?: string;
}

const UsersAwaitingApprovalList: NextPage = () => {
  const isMounted = useMounted();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const queryRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { user, sendRequest } = useAuth();
  const [users, setState] = React.useState<UserSummary[]>([]);
  // const [currentTab, setCurrentTab] = useState<TabValue>("all");
  // const [sort, setSort] = useState<SortDir>("desc");
  // const [page, setPage] = useState<number>(0);
  // const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  // const [orders, setOrders] = useState<{ orders: NewOrder[], filteredOrders: NewOrder[], sortedOrders: NewOrder[], paginatedOrders: NewOrder[]}>({orders: [], filteredOrders: [], sortedOrders: [], paginatedOrders: []});
  // const [filters, setFilters] = useState<Filters>({
  //   query: "",
  //   status: undefined,
  // });
  // const [drawer, setDrawer] = useState<{ isOpen: boolean; orderId?: string }>({
  //   isOpen: false,
  //   orderId: undefined,
  // });

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getUsers = useCallback(async () => {
    try {
      const data = await sendRequest("/api/users/awaitingApproval", "GET");
      if (!data) {
        return;
      }

      if (isMounted()) {
        setState(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, user]);

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
        <title>Admin: Users Awaiting Approval | Esox Biologics</title>
      </Head>
      <Typography sx={{ m: 5 }} variant="h4">
        Users awaiting approval
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
                <TableCell>Questionnaire</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.dateRegistered}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.contactNo}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() =>
                        router.push(
                          `/new-customer-questionnaire?userId=${user.id}`,
                        )
                      }
                    >
                      Open
                    </Button>
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

UsersAwaitingApprovalList.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default UsersAwaitingApprovalList;
