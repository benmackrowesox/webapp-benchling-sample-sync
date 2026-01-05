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
import { Post } from "src/types/blog";
import { BlogPostCard } from "src/components/blog/blog-post-card";
import { blogStore } from "src/lib/client/store/blogs";

const Finance: NextPage = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const [todos, setTodos] = useState<Array<Post>>([]);

  useEffect(() => {
    fetchPost();
    console.log(window.location.pathname);
  }, []);

  const fetchPost = async () => {
    await blogStore
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
      <title>Admin: Edit Blogs | Esox Biologics</title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Grid
            container
            justifyContent="space-between"
            alignItems={"center"}
            spacing={3}
          >
            <Grid item>
              <Typography variant="h4">Edit Blogs</Typography>
            </Grid>
            <Grid
              item
              sx={{
                display: "flex",
                flexWrap: "wrap",
                m: -1,
              }}
            >
              <NextLink href="/dashboard/edit-blogs/new" passHref legacyBehavior>
                <Button
                  startIcon={<ReportsIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="contained"
                >
                  New post
                </Button>
              </NextLink>
            </Grid>
          </Grid>
        </Box>
        <Divider />
        <Typography variant="h5" sx={{ pt: 2, pb: 2 }}>
          All blog posts
        </Typography>
        <Grid container spacing={3}>
          {todos.map((post) => (
            <BlogPostCard
              category={post.category}
              cover={post.cover}
              key={post.title}
              publishedAt={post.publishedAt}
              shortDescription={post.shortDescription}
              title={post.title}
              id={post.id}
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
