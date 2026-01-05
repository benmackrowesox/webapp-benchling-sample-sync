import { useCallback, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { File } from "../../../../components/file-dropzone";
import { FileDropzone } from "../../../../components/file-dropzone";
import TipTapEditor from "src/components/editor/tiptap-editor";

import { ArrowLeft as ArrowLeftIcon } from "../../../../icons/arrow-left";
import { gtm } from "../../../../lib/client/gtm";
import { fileToBase64 } from "../../../../utils/file-to-base64";
import { AdminGuard } from "src/components/authentication/auth-guard";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { useMounted } from "src/hooks/use-mounted";
import { useRouter } from "next/router";
import { blogStore } from "src/lib/client/store/blogs";
import {
  db,
  getImage,
  uploadBase64ToPublicFolder,
} from "src/lib/client/firebase";
import { Post } from "src/types/blog";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const BlogPostCreate: NextPage = () => {
  const router = useRouter();
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const handleDropCover = async ([file]: File[]) => {
    const data = (await fileToBase64(file)) as string;
    setCover(data);
  };

  const handleRemove = (): void => {
    setCover(null);
  };

  const isMounted = useMounted();
  const [post, setPost] = useState<Post | null>(null);
  const [image, setImage] = useState<string>();

  // editable by user
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [publishedAt, setPublishedAt] = useState<Date>(new Date());

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
          setTitle(data.title);
          setDescription(data.shortDescription);
          setContent(data.content);
          setCategory(data.category);
          setPublishedAt(new Date(data.publishedAt));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  async function publishChanges() {
    if (!post?.id) {
      return;
    }
    const newCover = cover
      ? await uploadBase64ToPublicFolder(cover)
      : post.cover;
    console.log(newCover);
    const newValue = content
      .replaceAll("<h1>", `<h1 style="color:#003F4C;font-weight:600">`)
      .replaceAll(
        "<h2>",
        `<h2 style="color:#003F4C;font-weight:600;font-size:1.5em">`,
      )
      .replaceAll(
        "<h3>",
        `<h3 style="color:#003F4C;font-weight:600;font-size:1.25em">`,
      );
    const newPost = {
      id: post.id,
      title,
      shortDescription: description,
      content: newValue,
      category,
      publishedAt: publishedAt.getTime(),
      cover: newCover,
    };
    await setDoc(doc(db, "blog-posts", post.id), newPost)
      .then((value) => {
        toast.success("Post updated");
      })
      .catch((reason) => {
        toast.error("Unable to update post");
      });
    blogStore.updatePost(post.id, newPost);
    await router.push(`/dashboard/edit-blogs/${post.id}`);
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Admin: Edit Blog Post | Esox Biologics</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <NextLink
            href={`/dashboard/edit-blogs/${post.id}`}
            passHref
            legacyBehavior
          >
            <Button
              component="a"
              startIcon={<ArrowLeftIcon fontSize="small" />}
            >
              {post.title}
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
            <Typography variant="h5">Edit post</Typography>
            <div>
              <NextLink href="/news" passHref legacyBehavior>
                <Button
                  component="a"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "inline-flex",
                    },
                    mr: 2,
                  }}
                  variant="outlined"
                >
                  Cancel
                </Button>
              </NextLink>
              <Button
                component="a"
                sx={{
                  display: {
                    xs: "none",
                    sm: "inline-flex",
                  },
                  mr: 2,
                }}
                variant="contained"
                onClick={publishChanges}
              >
                Publish changes
              </Button>
            </div>
          </Card>
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5">Basic details</Typography>
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  <div>
                    To make text in the title or description italic wrap the
                    text with two *asterix*
                  </div>
                </Alert>
              </Box>
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Post title"
                  name="title"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                  }}
                />
                <Box sx={{ mt: 3 }}>
                  <TextField
                    multiline
                    fullWidth
                    label="Short description"
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                    }}
                  />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                    }}
                  />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      onChange={(newDate) => {
                        if (newDate) {
                          setPublishedAt(newDate);
                        }
                      }}
                      label="Start date"
                      renderInput={(inputProps) => (
                        <TextField fullWidth {...inputProps} />
                      )}
                      value={publishedAt}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5">Post cover</Typography>
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  <div>
                    {`Only upload png's, please try and compress the file as much
                  as possible first`}
                  </div>
                </Alert>
              </Box>
              {image || cover ? (
                <Box
                  sx={{
                    backgroundImage: cover ? `url(${cover})` : `url(${image})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    borderRadius: 1,
                    aspectRatio: "20/13",
                    mt: 3,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    border: 1,
                    borderRadius: 1,
                    borderStyle: "dashed",
                    borderColor: "divider",
                    height: 230,
                    mt: 3,
                    p: 3,
                  }}
                >
                  <Typography align="center" color="textSecondary" variant="h6">
                    Select a cover image
                  </Typography>
                  <Typography
                    align="center"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                    variant="subtitle1"
                  >
                    Image used for the blog post cover and also for Open Graph
                    meta
                  </Typography>
                </Box>
              )}
              <Button onClick={handleRemove} sx={{ mt: 3 }} disabled={!cover}>
                Remove photo
              </Button>
              <Box sx={{ mt: 3 }}>
                <FileDropzone
                  accept={{
                    "image/*": [],
                  }}
                  maxFiles={1}
                  onDrop={handleDropCover}
                />
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5">Content</Typography>
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  <div>
                    The color and font weights of h1, h2 and h3 elements will be
                    converted to branding colors e.g. #003F4C, it only appears
                    black within this text box
                  </div>
                </Alert>
              </Box>
              <TipTapEditor
                placeholder="Write something"
                value={content}
                onChange={(value) => {
                  setContent(value);
                }}
              />
            </CardContent>
          </Card>
          <Box
            sx={{
              display: {
                sm: "none",
              },
              mt: 2,
            }}
          >
            <NextLink href="/news/1" passHref legacyBehavior>
              <Button component="a" variant="contained">
                Publish changes
              </Button>
            </NextLink>
          </Box>
        </Container>
      </Box>
    </>
  );
};

BlogPostCreate.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default BlogPostCreate;
