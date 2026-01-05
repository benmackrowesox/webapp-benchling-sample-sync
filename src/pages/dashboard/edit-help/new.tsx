import { useEffect, useState } from "react";
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
import type { File } from "../../../components/file-dropzone";
import { FileDropzone } from "../../../components/file-dropzone";
import TipTapEditor from "src/components/editor/tiptap-editor";

import { ArrowLeft as ArrowLeftIcon } from "../../../icons/arrow-left";
import { gtm } from "../../../lib/client/gtm";
import { fileToBase64 } from "../../../utils/file-to-base64";
import { AdminGuard } from "src/components/authentication/auth-guard";
import { DashboardLayout } from "src/components/dashboard/dashboard-layout";

import { useRouter } from "next/router";
import {
  db,
  uploadBase64PDFToPublicFolder,
  uploadBase64ToPublicFolder,
} from "src/lib/client/firebase";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { helpStore } from "src/lib/client/store/help";
import { HelpPage } from "src/types/helpPage";

const HelpPageCreate: NextPage = () => {
  const router = useRouter();
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const handleDropCover = async ([file]: File[]) => {
    const data = (await fileToBase64(file)) as string;
    setCover(data);
  };

  const handleDropPdf = async ([file]: File[]) => {
    const data = (await fileToBase64(file)) as string;
    setPdfAttachment({ data: data, name: file.name });
  };

  const handleRemove = (): void => {
    setCover(null);
  };

  const handleRemovePdf = (): void => {
    setPdfAttachment(undefined);
  };

  // editable by user
  const [id, setId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [pdfAttachment, setPdfAttachment] = useState<{
    name: string;
    data: string;
  }>();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  async function publishChanges() {
    const newId = id
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g, "");
    const newCover = await uploadBase64ToPublicFolder(cover ?? "");
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
    const newPdfAttachment =
      pdfAttachment?.data &&
      (await uploadBase64PDFToPublicFolder(pdfAttachment.data));
    const newHelpPage: HelpPage = {
      id: newId,
      title,
      shortDescription: description,
      content: newValue,
      category,
      cover: newCover,
    };
    if (newPdfAttachment) {
      newHelpPage.pdfFile = newPdfAttachment;
      newHelpPage.pdfName = pdfAttachment?.name;
    }
    await setDoc(doc(db, "help-pages", newId), newHelpPage)
      .then((value) => {
        toast.success("Help page updated");
      })
      .catch((reason) => {
        toast.error("Unable to update post");
      });
    helpStore.addPost(newHelpPage);
    await router.push(`/dashboard/edit-help/${newId}`);
  }

  return (
    <>
      <Head>
        <title>Admin: New Help Page | Esox Biologics</title>
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
              Edit help pages
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
            <Typography variant="h5">New help page</Typography>
            <div>
              <NextLink href="/dashboard/edit-help" passHref legacyBehavior>
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
                Publish help page
              </Button>
            </div>
          </Card>
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5">Basic details</Typography>
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info">
                    <div>
                      This will be the url of the help page when it has been
                      posted. For example, an id of{" "}
                      <b>how-to-collect-samples</b> will produce the URL{" "}
                      <b>www.esoxbiologics.com/blog/how-to-collect-samples</b>.
                    </div>
                  </Alert>
                </Box>
                <TextField
                  fullWidth
                  label="Post ID"
                  name="id"
                  value={id}
                  onChange={(event) => {
                    setId(event.target.value);
                  }}
                />
                <Box sx={{ my: 3 }}>
                  <Alert severity="info">
                    <div>
                      To make text in the title or description italic wrap the
                      text with two *asterisks*
                    </div>
                  </Alert>
                </Box>
                <TextField
                  fullWidth
                  label="Page title"
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
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5">Help page cover</Typography>
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  <div>
                    {`Only upload PNGs, and please try and compress the file as much
                  as possible first.`}
                  </div>
                </Alert>
              </Box>
              {cover ? (
                <Box
                  sx={{
                    backgroundImage: `url(${cover})`,
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
                    aspectRatio: "20/13",
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
                    Image used for the help page cover
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
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h5">PDF Attachment</Typography>
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
                  mt: 3,
                  p: 3,
                }}
              >
                <Typography align="center" color="textSecondary" variant="h6">
                  {pdfAttachment
                    ? "Text at bottom of help page"
                    : "Select a PDF attachment"}
                </Typography>
                <Typography
                  align="center"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                  variant="subtitle1"
                >
                  <>
                    <br />
                    {pdfAttachment && (
                      <>
                        See attached document -{" "}
                        <a href="">{pdfAttachment.name}</a>
                      </>
                    )}
                  </>
                </Typography>
              </Box>
              <Button
                onClick={handleRemovePdf}
                sx={{ mt: 3 }}
                disabled={!pdfAttachment}
              >
                Remove PDF
              </Button>
              <Box sx={{ mt: 3 }}>
                <FileDropzone
                  accept={{
                    "application/pdf": [],
                  }}
                  maxFiles={1}
                  onDrop={handleDropPdf}
                />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

HelpPageCreate.getLayout = (page) => (
  <AdminGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AdminGuard>
);

export default HelpPageCreate;
