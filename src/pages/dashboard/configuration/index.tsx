import React, { useEffect, useMemo, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { AdminGuard } from "src/components/authentication/auth-guard";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { PageHelpSection } from "src/components/dashboard/page-help-section";

import { orderStore } from "src/lib/client/store/orders";
import { useTypedAuth } from "src/hooks/use-auth";
import { gtm } from "src/lib/client/gtm";
import type { NewOrder } from "src/types/order";

const getSuggestedHostSpeciesFromOrders = (
  orders: NewOrder[],
  hostSpecies: string[] | undefined,
) => {
  // const suggestions = orders
  //   .map((order) =>
  //     order.requestedServices
  //       .map((service) => service.hostSpecies)
  //       .filter((hostSpecies) => hostSpecies),
  //   )
  //   .flat(1);

  // return Array.from(new Set(suggestions)).filter(
  //   (suggestion) => !hostSpecies?.includes(suggestion),
  // );
  return [];
};

const Configuration: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Admin: Configuration | Esox Biologics</title>
      </Head>
      <Typography sx={{ m: 5 }} variant="h4">
        Configuration
      </Typography>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <NewOrderHostSpeciesConfiguration />
        </Container>
      </Box>
    </>
  );
};

const NewOrderHostSpeciesConfiguration = ({}) => {
  const { user, sendRequest } = useTypedAuth();
  const [hostSpecies, setHostSpecies] = useState<string[]>();
  const [fetch, setFetch] = useState<boolean>(true);
  const [newHostSpecies, setNewHostSpecies] = useState<string>("");
  const [hostSpeciesError, setHostSpeciesError] = useState<string | null>(null);

  const [orders, setOrders] = useState<NewOrder[]>([]);

  useEffect(() => {
    async function fetchDropdownOptions() {
      const response = await sendRequest<void, Record<string, string[]>>(
        "/api/customer-options/request-page",
        "GET",
      );
      setHostSpecies(response?.hostSpecies);
      setFetch(false);
    }
    if (!hostSpecies || fetch) {
      fetchDropdownOptions().catch((error) => {
        console.error(error);
      });
    }
  }, [sendRequest, hostSpecies, fetch]);

  useEffect(() => {
    async function getOrders() {
      try {
        if (!user) {
          return;
        }
        const data = await orderStore.getOrdersByUser(user);
        setOrders(data ?? []);
      } catch (err) {
        console.error(err);
      }
    }
    getOrders();
  }, [user]);

  const hostSpeciesSuggestions = useMemo(
    () => getSuggestedHostSpeciesFromOrders(orders, hostSpecies),
    [orders, hostSpecies],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostSpeciesError(null);
    setNewHostSpecies(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newHostSpecies?.trim() === "") {
      return;
    }
    if (hostSpecies?.includes(newHostSpecies)) {
      setHostSpeciesError("This species already exists.");
      return;
    }

    try {
      await sendRequest("/api/customer-options/request-page", "POST", {
        hostSpecies: newHostSpecies,
      });
      setFetch(true);
      setNewHostSpecies("");
    } catch (error) {
      toast.error("Could not add a new host species.");
    }
  };

  const onRemoveHostSpecies = async (aHostSpecies: string) => {
    try {
      await sendRequest(
        `/api/customer-options/request-page?hostSpecies=${aHostSpecies}`,
        "DELETE",
      );
      setFetch(true);
    } catch (error) {
      toast.error("Could not delete the host species.");
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" mb={2}>
            Host species
          </Typography>
          <PageHelpSection>
            <Typography variant="body2">
              Add or remove host species available to users when creating a new
              order.
              <Typography variant="body2" mt={2} color="primary">
                <strong>NOTE!</strong> New host species will{" "}
                <strong>NOT</strong> be linked to Benchling drowdown options by
                default. This means new host species will not appear in the
                Schema Field but will be available in the Custom Fields as
                before.
              </Typography>
            </Typography>
          </PageHelpSection>
          <Grid container spacing={10}>
            <Grid item xs={12} md={5}>
              <List dense={true}>
                <Typography variant="h6" mb={2}>
                  Current host species
                </Typography>
                {hostSpecies?.map((aHostSpecies) => (
                  <ListItem
                    key={aHostSpecies}
                    secondaryAction={
                      <Tooltip title="Delete species">
                        <IconButton
                          onClick={() => onRemoveHostSpecies(aHostSpecies)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText primary={aHostSpecies} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={7} sx={{ mt: 7 }}>
              <Typography variant="subtitle2" sx={{ pb: 3 }}>
                Add a new host species as{" "}
                <strong>Common name (latin name)</strong>
              </Typography>
              <form onSubmit={handleSubmit}>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    fullWidth
                    error={hostSpeciesError !== null}
                    label="New host species"
                    variant="outlined"
                    helperText={hostSpeciesError ?? ""}
                    value={newHostSpecies}
                    onChange={onChange}
                  />
                  <Button type="submit" variant="contained" color="primary">
                    Submit
                  </Button>
                </Box>
              </form>
              <Typography variant="h6" sx={{ pt: 6 }}>
                Suggestions from existing orders
              </Typography>
              <List dense={true}>
                {hostSpeciesSuggestions.map((aHostSpecies) => (
                  <ListItem key={aHostSpecies}>
                    <ListItemText primary={aHostSpecies} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

Configuration.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default Configuration;
