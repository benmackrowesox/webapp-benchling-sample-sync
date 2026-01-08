import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box, Container, Divider, Grid, Typography } from "@mui/material";
import { helpStore } from "../../../lib/client/store/help";
import { useMounted } from "../../../hooks/use-mounted";
import { gtm } from "../../../lib/client/gtm";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { HelpPage } from "src/types/helpPage";
import { HelpPostCard } from "src/components/help/help-post-card";
import { AuthGuard } from "src/components/authentication/auth-guard";

const DashboardHelpPages: NextPage = () => {
  const isMounted = useMounted();
  const [posts, setPosts] = useState<HelpPage[]>([]);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getPosts = useCallback(async () => {
    try {
      const data = await helpStore.getHelpPages();

      if (isMounted()) {
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  return (
    <>
      <Head>
        <title>Help | Esox Biologics</title>
        <meta property="og:title" content="Help | Esox Biologics" key="title" />
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Typography sx={{ mt: 3, mb: 2 }} variant="h4">
            Help Pages
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            Need help? Check the help pages below.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3}>
            {posts.map((post) => (
              <HelpPostCard
                category={post.category}
                cover={post.cover}
                key={post.title}
                shortDescription={post.shortDescription}
                title={post.title}
                id={post.id}
              />
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

DashboardHelpPages.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default DashboardHelpPages;

