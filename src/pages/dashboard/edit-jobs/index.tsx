import { useEffect, useState } from "react";
import type { NextPage } from "next";
import NextLink from "next/link";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { AdminGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { Reports as ReportsIcon } from "../../../icons/reports";
import { gtm } from "../../../lib/client/gtm";
import {
  opportunitiesStore,
  Opportunity,
} from "src/lib/client/store/opportunities";
import { DeleteableJobPostCard } from "src/components/blog/job-post-card";

const Finance: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const [todos, setTodos] = useState<Array<Opportunity>>([]);

  useEffect(() => {
    fetchPost();
    console.log(window.location.pathname);
  }, []);

  const fetchPost = async () => {
    await opportunitiesStore
      .getPosts()
      .then((posts) => {
        setTodos(posts);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return <>
    <Head>
      <title>Admin: Edit Jobs | Esox Biologics</title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Grid
            container
            justifyContent="space-between"
            alignItems={"center"}
            spacing={3}
          >
            <Grid item>
              <Typography variant="h4">Edit Jobs</Typography>
            </Grid>
            <Grid
              item
              sx={{
                display: "flex",
                flexWrap: "wrap",
                m: -1,
              }}
            >
              <NextLink href="/dashboard/edit-jobs/new" passHref legacyBehavior>
                <Button
                  startIcon={<ReportsIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="contained"
                >
                  New job
                </Button>
              </NextLink>
            </Grid>
          </Grid>
        </Box>
        <Divider />
        <Typography variant="h5" sx={{ pt: 2, pb: 2 }}>
          All job posts
        </Typography>
        <Grid container spacing={3}>
          {todos.map((post) => (
            <DeleteableJobPostCard
              key={post.id}
              id={post.id}
              name={post.name}
              location={post.location}
              linkedin={post.linkedin}
              pdfFile={post.pdfFile}
            />
          ))}
        </Grid>
      </Container>
    </Box>
  </>;
};

Finance.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default Finance;
