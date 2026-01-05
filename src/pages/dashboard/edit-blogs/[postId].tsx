import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { format, subHours } from "date-fns";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { blogStore } from "../../../lib/client/store/blogs";
import { ArrowLeft as ArrowLeftIcon } from "../../../icons/arrow-left";
import { useMounted } from "../../../hooks/use-mounted";
import { gtm } from "../../../lib/client/gtm";
import type { Post } from "../../../types/blog";
import { getImage } from "src/lib/client/firebase";
import { AdminGuard } from "src/components/authentication/auth-guard";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { useRouter } from "next/router";

interface Comment {
  id: string;
  authorAvatar: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: number;
  isLiked: boolean;
  likes: number;
}

const comments: Comment[] = [
  {
    id: "d0ab3d02ef737fa6b007e35d",
    authorAvatar: "/static/mock-images/avatars/avatar-alcides_antonio.png",
    authorName: "Alcides Antonio",
    authorRole: "Product Designer",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    createdAt: subHours(new Date(), 2).getTime(),
    isLiked: true,
    likes: 12,
  },
  {
    id: "3ac1e17289e38a84108efdf3",
    authorAvatar: "/static/mock-images/avatars/avatar-jie_yan_song.png",
    authorName: "Jie Yan Song",
    authorRole: "Web Developer",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
    createdAt: subHours(new Date(), 8).getTime(),
    isLiked: false,
    likes: 8,
  },
];

const MarkdownWrapper = styled("div")(({ theme }) => ({
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  "& h2": {
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: theme.typography.h5.lineHeight,
    marginBottom: theme.spacing(3),
  },
  "& h3": {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: theme.typography.h3.lineHeight,
    marginBottom: theme.spacing(3),
  },
  "& p": {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    marginBottom: theme.spacing(2),
  },
  "& li": {
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    marginBottom: theme.spacing(1),
  },
  "& :visited": {
    color: theme.palette.primary.main,
  },
  "& :link": {
    color: theme.palette.primary.main,
  },
}));

const BlogPostDetails: NextPage = () => {
  const isMounted = useMounted();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);

  const [image, setImage] = useState<string>();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getPost = useCallback(async () => {
    try {
      const postId = window.location.pathname.split("/").pop();
      const data = await blogStore.getPost(postId ?? "");

      if (isMounted()) {
        if (data) {
          setPost(data);
          const image = await getImage(data.cover);
          setImage(image);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  if (!post) {
    return null;
  }

  return <>
    <Head>
      <title>Admin: Blog Post Details | Esox Biologics</title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <NextLink href="/dashboard/edit-blogs" passHref legacyBehavior>
          <Button
            component="a"
            startIcon={<ArrowLeftIcon fontSize="small" />}
          >
            Edit Blog
          </Button>
        </NextLink>
        <Card
          elevation={16}
          sx={{
            alignItems: "center",
            borderRadius: 1,
            display: "flex",
            justifyContent: "space-between",
            mb: 8,
            mt: 6,
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="subtitle1">
            View the live blog below
          </Typography>
          <Box>
            <NextLink href={`/dashboard/edit-blogs/edit/${post.id}`} passHref legacyBehavior>
              <Button component="a" variant="contained" sx={{ mr: 2 }}>
                Edit Post
              </Button>
            </NextLink>
            <Button
              component="a"
              variant="contained"
              color="error"
              onClick={async () => {
                await blogStore.deletePost(post);
                router.push("/dashboard/edit-blogs");
              }}
            >
              Delete Post
            </Button>
          </Box>
        </Card>
        <div></div>
        <Chip sx={{ mt: 2 }} label={post.category} />
        <Typography sx={{ mt: 3 }} variant="h3">
          {post.title && <Markdown children={post.title} />}
        </Typography>
        <Typography color="textSecondary" sx={{ mt: 3 }} variant="subtitle1">
          {post.shortDescription && (
            <Markdown children={post.shortDescription} />
          )}
        </Typography>
        <Typography
          color="textSecondary"
          sx={{ flexGrow: 1 }}
          variant="body2"
        >
          {`${format(post.publishedAt, "dd MMM yyyy")}`}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            backgroundImage: `url(${image})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            borderRadius: 1,
            height: {
              xs: 200,
              sm: 380,
            },
            my: 3,
          }}
        />

        <Box>
          <MarkdownWrapper>
            {post.content && (
              <Markdown children={post.content} rehypePlugins={[rehypeRaw]} />
            )}
          </MarkdownWrapper>
        </Box>
        <Divider sx={{ my: 3 }} />
      </Container>
    </Box>
  </>;
};

BlogPostDetails.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default BlogPostDetails;
