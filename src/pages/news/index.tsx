import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box, Container, Divider, Grid, Typography } from "@mui/material";
import { blogStore } from "../../lib/client/store/blogs";
import { BlogPostCard } from "../../components/blog/blog-post-card";
import { useMounted } from "../../hooks/use-mounted";
import { gtm } from "../../lib/client/gtm";
import type { Post } from "../../types/blog";
import { MainLayout } from "src/components/main-layout";

const BlogPostList: NextPage = () => {
  const isMounted = useMounted();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getPosts = useCallback(async () => {
    try {
      const data = await blogStore.getPosts();

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
        <title>Blog | Esox Biologics</title>
        <meta property="og:title" content="Blog | Esox Biologics" key="title" />
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
            Latest News
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            Discover the latest news, articles and user research insights from
            Esox.
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3}>
            {posts.map((post) => (
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
    </>
  );
};

BlogPostList.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default BlogPostList;
