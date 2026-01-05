import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
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
import { ArrowLeft as ArrowLeftIcon } from "../../../icons/arrow-left";
import { useMounted } from "../../../hooks/use-mounted";
import { gtm } from "../../../lib/client/gtm";
import { getImage } from "src/lib/client/firebase";
import { AdminGuard } from "src/components/authentication/auth-guard";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { useRouter } from "next/router";
import { helpStore } from "src/lib/client/store/help";
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

const BlogPostDetails: NextPage = () => {
  const isMounted = useMounted();
  const router = useRouter();
  const [helpPage, setHelpPage] = useState<HelpPage | null>(null);

  const [image, setImage] = useState<string>();
  const [pdfAttachment, setPdfAttachment] = useState<string>();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getPost = useCallback(async () => {
    try {
      const postId = window.location.pathname.split("/").pop();
      const data = await helpStore.getPost(postId ?? "");

      if (isMounted()) {
        if (data) {
          setHelpPage(data);
          const image = await getImage(data.cover);
          setImage(image);
          const pdfAttachment = data.pdfFile && (await getImage(data.pdfFile));
          setPdfAttachment(pdfAttachment);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  if (!helpPage) {
    return null;
  }

  function attachmentLink(post: HelpPage) {
    if (!post.pdfFile) {
      return "";
    }
    return `<br/><hr/><br/><b>See attached document: <a href="${
      post.pdfFile
    }" rel="noopener noreferrer" target="_blank">${
      post.pdfName ?? "Click here"
    }</a></b>`;
  }

  return <>
    <Head>
      <title>Admin: Help Page Details | Esox Biologics</title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <NextLink href="/dashboard/edit-help" passHref legacyBehavior>
          <Button
            component="a"
            startIcon={<ArrowLeftIcon fontSize="small" />}
          >
            Edit Help pages
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
            View the help page below
          </Typography>
          <Box>
            <NextLink href={`/dashboard/edit-help/edit/${helpPage.id}`} passHref legacyBehavior>
              <Button component="a" variant="contained" sx={{ mr: 2 }}>
                Edit Help page
              </Button>
            </NextLink>
            <Button
              component="a"
              variant="contained"
              color="error"
              onClick={async () => {
                await helpStore.deletePost(helpPage);
                router.push("/dashboard/edit-help");
              }}
            >
              Delete Help page
            </Button>
          </Box>
        </Card>
        <div></div>
        <Chip sx={{ mt: 2 }} label={helpPage.category} />
        <Typography sx={{ mt: 3 }} variant="h3">
          {helpPage.title && <Markdown children={helpPage.title} />}
        </Typography>
        <Typography color="textSecondary" sx={{ mt: 3 }} variant="subtitle1">
          {helpPage.shortDescription && (
            <Markdown children={helpPage.shortDescription} />
          )}
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
            {helpPage.content && (
              <Markdown
                children={`${helpPage.content}${attachmentLink(helpPage)}`}
                rehypePlugins={[rehypeRaw]}
              />
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
