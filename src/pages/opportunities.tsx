import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useMounted } from "../hooks/use-mounted";
import { gtm } from "../lib/client/gtm";
import { MainLayout } from "src/components/main-layout";
import {
  opportunitiesStore,
  Opportunity,
} from "src/lib/client/store/opportunities";
import { JobPostCard } from "src/components/blog/job-post-card";

type Job = {
  name: "Head of Bioinformatics";
  location: "London, UK";
  linkedin: "fdsa";
};

const OPPORTUNITIES_CONTACT_EMAIL = "opportunities@esoxbiologics.com";

const BlogPostList: NextPage = () => {
  const theme = useTheme();
  const isMounted = useMounted();
  const [posts, setPosts] = useState<Opportunity[]>([]);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getPosts = useCallback(async () => {
    try {
      const data = await opportunitiesStore.getPosts();

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

  const onClickContact = () => {
    const subject = "";
    const body = "";
    const mailtoLink = `mailto:${OPPORTUNITIES_CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

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
        <Container maxWidth="md">
          <Typography sx={{ mt: 3, mb: 2 }} variant="h4">
            Opportunities
          </Typography>
          <Typography color="textSecondary">
            <Box component={"em"}>Esox</Box> Biologics is a venture-backed
            start-up utilising data science, next-generation sequencing and
            synthetic biology to create a more efficient and sustainable
            aquaculture industry. We strive to optimise farm yields, improve
            animal welfare and secure sustainable food supplies.
          </Typography>
          {/* <Typography color="textSecondary" variant="subtitle1">
            You will learn about web infrastructure, design systems and devops
            APIs best practices.
          </Typography> */}
          <Divider sx={{ my: 3 }} />
          <Grid container spacing={3}>
            {posts.map((post) => (
              <JobPostCard
                key={post.id}
                id={post.id}
                name={post.name}
                location={post.location}
                linkedin={post.linkedin}
                pdfFile={post.pdfFile}
              />
            ))}
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography color="textSecondary">
            Can’t find the right role? Email your resume to{" "}
            <Box component={"em"} sx={{ color: theme.palette.primary.main }}>
              {OPPORTUNITIES_CONTACT_EMAIL}{" "}
            </Box>
            to begin an open application.
          </Typography>
          <Button variant="outlined" sx={{ mt: 3 }} onClick={onClickContact}>
            Contact
          </Button>
        </Container>
      </Box>
    </>
  );
};

BlogPostList.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default BlogPostList;
