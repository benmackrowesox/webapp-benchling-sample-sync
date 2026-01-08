import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Divider,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { orderStore } from "../../../lib/client/store/orders";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { OrderListTable } from "../../../components/dashboard/order/order-list-table";
import { useMounted } from "../../../hooks/use-mounted";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/client/gtm";
import type { NewOrder, OrderStatus } from "../../../types/order";
import { useRouter } from "next/router";
import { useAuth } from "src/hooks/use-auth";
import NextLink from "next/link";

interface Filters {
  query?: string;
  status?: OrderStatus;
}

type SortDir = "asc" | "desc";

interface SortOption {
  label: string;
  value: SortDir;
}

type TabValue = "all" | "reviewing" | "approved" | "kit-sent" | "kit-arrived";

interface Tab {
  label: string;
  value: TabValue;
}

const tabs: Tab[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Reviewing",
    value: "reviewing",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Kit Sent",
    value: "kit-sent",
  },
  {
    label: "Kit Arrived",
    value: "kit-arrived",
  },
];

const sortOptions: SortOption[] = [
  {
    label: "Newest",
    value: "desc",
  },
  {
    label: "Oldest",
    value: "asc",
  },
];

const applyFilters = (orders: NewOrder[], filters: Filters) =>
  orders.filter((order) => {
    if (filters.query) {
      // checks only the order id, but can be extended to support other fields, such as customer
      // name, email, etc.
      const containsQuery = (order.id || "")
        .toLowerCase()
        .includes(filters.query.toLowerCase());

      if (!containsQuery) {
        return false;
      }
    }

    if (typeof filters.status !== "undefined") {
      const statusMatched = order.status === filters.status;

      if (!statusMatched) {
        return false;
      }
    }

    return true;
  });

const applySort = (orders: NewOrder[], sortDir: SortDir): NewOrder[] =>
  orders.sort((a, b) => {
    const comparator = a.createdAt > b.createdAt ? -1 : 1;

    return sortDir === "desc" ? comparator : -comparator;
  });

const applyPagination = (
  orders: NewOrder[],
  page: number,
  rowsPerPage: number,
): NewOrder[] =>
  orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

const OrderListInner = styled("div", {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  flexGrow: 1,
  overflow: "hidden",
  paddingBottom: theme.spacing(8),
  paddingTop: theme.spacing(8),
  zIndex: 1,
  // [theme.breakpoints.up("lg")]: {
  //   marginRight: -500,
  // },
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    [theme.breakpoints.up("lg")]: {
      marginRight: 0,
    },
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const OrderList: NextPage = () => {
  const isMounted = useMounted();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const queryRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const { user, sendRequest } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabValue>("all");
  const [sort, setSort] = useState<SortDir>("desc");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [orders, setOrders] = useState<NewOrder[]>([]);

  const [filters, setFilters] = useState<Filters>({
    query: "",
    status: undefined,
  });
  const [drawer, setDrawer] = useState<{ isOpen: boolean; orderId?: string }>({
    isOpen: false,
    orderId: undefined,
  });

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getOrders = useCallback(async () => {
    try {
      const data = await orderStore.getOrdersByUser(user);
      // console.log(data);
      if (!data) {
        return;
      }

      if (isMounted()) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, user]);

  useEffect(
    () => {
      getOrders();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleTabsChange = (event: ChangeEvent<{}>, value: TabValue): void => {
    setCurrentTab(value);
    setFilters((prevState) => ({
      ...prevState,
      status: value === "all" ? undefined : value,
    }));
  };

  const handleQueryChange = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  };

  const handleSortChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value as "asc" | "desc";
    setSort(value);
  };

  const handlePageChange = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleOrderChanged = (order: NewOrder) => {
    orderStore.updateOrderStatus(order, {});
    // usually query is done on backend with indexing solutions
    setOrders([...orderStore.orders]);
  };

  const handleOpenDrawer = (orderId: string): void => {
    setDrawer({
      isOpen: true,
      orderId,
    });
  };

  const handleCloseDrawer = () => {
    setDrawer({
      isOpen: false,
      orderId: undefined,
    });
  };

  const [dialog, setDialog] = useState<any>({
    isOpen: false,
    eventId: undefined,
    range: undefined,
  });

  const handleAddClick = (): void => {
    setDialog({
      isOpen: true,
    });
  };

  const handleCloseDialog = (): void => {
    setDialog({
      isOpen: false,
    });
  };

  // usually query is done on backend with indexing solutions
  const filteredOrders = applyFilters(orders, filters);
  const sortedOrders = applySort(filteredOrders, sort);
  const paginatedOrders = applyPagination(sortedOrders, page, rowsPerPage);

  return (
    <>
      <Head>
        <title>Orders | Esox Biologics</title>
      </Head>
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
        <OrderListInner open={drawer.isOpen}>
          <Box sx={{ px: 3 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">Orders</Typography>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3, mb: 2 }}>
              <AlertTitle>Legacy System</AlertTitle>
              This page shows historical orders from the legacy system. 
              For new sample submissions, please use the <NextLink href="/dashboard/projects" style={{ color: '#1976d2', fontWeight: 500 }}>Projects</NextLink> system. 
              Projects allow for better organization of samples and easier collaboration.
            </Alert>
            
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              sx={{ mt: 1 }}
              variant="scrollable"
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </Box>
          <Divider />
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              m: -1.5,
              p: 3,
            }}
          >
            <Box
              component="form"
              onSubmit={handleQueryChange}
              sx={{
                flexGrow: 1,
                m: 1.5,
              }}
            >
              <TextField
                defaultValue=""
                fullWidth
                inputProps={{ ref: queryRef }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search by order number"
              />
            </Box>
            <TextField
              label="Sort By"
              name="order"
              onChange={handleSortChange}
              select
              SelectProps={{ native: true }}
              sx={{ m: 1.5 }}
              value={sort}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Box>
          <Divider />
          <OrderListTable
            onOpenDrawer={(orderId, status, allSamplesSubmitted) => {
              if (status == "kit-arrived" && !allSamplesSubmitted) {
                router.push(`/dashboard/orders/${orderId}/sample-submission`);
              } else {
                router.push(`/dashboard/orders/${orderId}`);
              }
            }}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onOrderChanged={(updatedOrder) => {
              handleOrderChanged(updatedOrder);
            }}
            orders={paginatedOrders}
            ordersCount={filteredOrders.length}
            page={page}
            rowsPerPage={rowsPerPage}
          />
        </OrderListInner>
      </Box>
    </>
  );
};

OrderList.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default OrderList;
