import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { helpStore } from "../../lib/client/store/help";
import { ArrowLeft as ArrowLeftIcon } from "../../icons/arrow-left";
import { useMounted } from "../../hooks/use-mounted";
import { gtm } from "../../lib/client/gtm";
import { MainLayout } from "src/components/main-layout";
import { getImage } from "src/lib/client/firebase";
import { HelpPage } from "src/types/helpPage";

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

const HelpPostDetails: NextPage = () => {
  const isMounted = useMounted();
  const [post, setPost] = useState<HelpPage | null>(null);

  const [image, setImage] = useState<string>();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getPost = useCallback(async () => {
    try {
      const postId = window.location.pathname.split("/").pop();
      const data = await helpStore.getPost(postId ?? "");

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

  function attachmentLink(post: HelpPage) {
    if (!post.pdfFile) {
      return "";
    }
    return `<b>See attached document: <a href="${
      post.pdfFile
    }" rel="noopener noreferrer" target="_blank">${
      post.pdfName ?? "Click here"
    }</a></b>`;
  }

  return <>
    <Head>
      <title>Help - {post?.title} | Esox Biologics</title>
      <meta
        property="og:title"
        content={`Help - ${post?.title} | Esox Biologics`}
        key="title"
      />
      <desc>{post?.shortDescription}</desc>
      <meta
        property="og:description"
        content={`${post?.shortDescription}`}
        key="title"
      />
      <link rel="image_src" href={`${post.cover}`} />
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <NextLink href="/help" passHref legacyBehavior>
          <Button
            component="a"
            startIcon={<ArrowLeftIcon fontSize="small" />}
          >
            Help pages
          </Button>
        </NextLink>
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
        <Box>
          <MarkdownWrapper>
            <Markdown
              children={`${attachmentLink(post)}`}
              rehypePlugins={[rehypeRaw]}
            />
          </MarkdownWrapper>
        </Box>

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
              <Markdown
                children={`${post.content}<br/><hr/><br/>${attachmentLink(
                  post
                )}`}
                rehypePlugins={[rehypeRaw]}
              />
            )}
          </MarkdownWrapper>
        </Box>
      </Container>
    </Box>
  </>;
};

HelpPostDetails.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default HelpPostDetails;
